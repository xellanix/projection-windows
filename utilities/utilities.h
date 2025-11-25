#pragma once
#include <zip.h>
#include <vector>
#include <string>
#include <filesystem>
#include <Windows.h>
#include <commdlg.h>
#include <fstream>
#include <sstream>
#include "json.hpp"
#include <map>
#include <thread>

namespace fs = std::filesystem;

struct FileNode
{
    std::string name;
    std::map<std::string, std::unique_ptr<FileNode>> children;
};

struct ZipEntry
{
    std::string source_path;
    std::string target_name;
};

inline std::pair<bool, std::string> create_zip_archive(
    const std::string& output_zip_path,
    const std::vector<ZipEntry>& entries
)
{
    int error_code = 0;
    zip_t* archive = zip_open(output_zip_path.c_str(), ZIP_CREATE | ZIP_TRUNCATE, &error_code);

    if (!archive)
    {
        zip_error_t ziperror;
        zip_error_init_with_code(&ziperror, error_code);
        std::string msg = "Failed to open zip: " + std::string(zip_error_strerror(&ziperror));
        zip_error_fini(&ziperror);
        return { false, msg };
    }

    for (const auto& entry : entries)
    {
        fs::path src_path(entry.source_path);
        fs::path target_root(entry.target_name);

        if (!fs::exists(src_path))
        {
            zip_close(archive);
            return { false, "Source path does not exist: " + entry.source_path };
        }

        if (fs::is_directory(src_path))
        {
            for (const auto& dir_entry : fs::recursive_directory_iterator(src_path))
            {
                if (dir_entry.is_regular_file())
                {
                    fs::path relative_part = fs::relative(dir_entry.path(), src_path);
                    fs::path final_zip_path = target_root / relative_part;

                    zip_source_t* source = zip_source_file(archive, dir_entry.path().string().c_str(), 0, -1);
                    if (!source)
                    {
                        zip_close(archive);
                        return { false, "Failed to read file: " + dir_entry.path().string() };
                    }

                    if (zip_file_add(archive, final_zip_path.generic_string().c_str(), source, ZIP_FL_OVERWRITE | ZIP_FL_ENC_UTF_8) < 0)
                    {
                        zip_source_free(source);
                        zip_close(archive);
                        return { false, "Failed to add to zip: " + final_zip_path.string() };
                    }
                }
            }
        }
        else
        {
            zip_source_t* source = zip_source_file(archive, src_path.string().c_str(), 0, -1);
            if (!source)
            {
                zip_close(archive);
                return { false, "Failed to read file: " + src_path.string() };
            }

            if (zip_file_add(archive, target_root.generic_string().c_str(), source, ZIP_FL_OVERWRITE | ZIP_FL_ENC_UTF_8) < 0)
            {
                zip_source_free(source);
                zip_close(archive);
                return { false, "Failed to add to zip: " + target_root.string() };
            }
        }
    }

    if (zip_close(archive) < 0)
    {
        return { false, "Failed to write/close zip archive." };
    }

    return { true, "" };
}

inline std::pair<bool, std::string> extract_mapped_zip_archive(
    const std::string& zip_filename,
    const std::vector<ZipEntry>& entries
)
{
    int error_code = 0;
    zip_t* archive = zip_open(zip_filename.c_str(), ZIP_RDONLY, &error_code);

    if (!archive)
    {
        zip_error_t ziperror;
        zip_error_init_with_code(&ziperror, error_code);
        std::string msg = "Failed to open zip: " + std::string(zip_error_strerror(&ziperror));
        zip_error_fini(&ziperror);
        return { false, msg };
    }

    zip_int64_t num_entries = zip_get_num_entries(archive, 0);
    const size_t BUFFER_SIZE = 4096;
    std::vector<char> buffer(BUFFER_SIZE);

    // Iterate through every file INSIDE the zip archive
    for (zip_int64_t i = 0; i < num_entries; ++i)
    {
        const char* name_cstr = zip_get_name(archive, i, 0);
        if (!name_cstr) continue;

        std::string zip_entry_name = name_cstr;

        // Check this zip entry against the user's mapping list
        for (const auto& map : entries)
        {
            fs::path final_dest_path;
            bool match_found = false;

            // CASE 1: Exact Match (File to File)
            if (zip_entry_name == map.target_name)
            {
                final_dest_path = fs::path(map.source_path);
                match_found = true;
            }
            // CASE 2: Directory Match (Folder to Folder)
            // Check if the zip entry starts with the mapped target directory
            else if (zip_entry_name.find(map.target_name) == 0)
            {
                // Ensure it's actually a directory boundary (prevent "img" matching "img_backup")
                // The map.target_name should ideally end with '/'
                char last_char = map.target_name.back();
                if (last_char == '/' || zip_entry_name[map.target_name.length()] == '/')
                {

                    // 1. Remove the mapped prefix from the zip entry
                    // e.g. Zip: "assets/img/logo.png", Map: "assets/" -> remainder: "img/logo.png"
                    std::string remainder = zip_entry_name.substr(map.target_name.length());

                    // 2. Clean up leading slashes if any
                    if (!remainder.empty() && remainder[0] == '/') remainder.erase(0, 1);

                    // 3. Append remainder to the Disk Destination
                    final_dest_path = fs::path(map.source_path) / remainder;
                    match_found = true;
                }
            }

            // If we found a mapping rule that applies, extract it
            if (match_found)
            {
                // Skip if it's just a directory entry in the zip
                if (zip_entry_name.back() == '/') continue;

                // Create parent directories on disk
                std::error_code ec;
                fs::create_directories(final_dest_path.parent_path(), ec);
                if (ec)
                {
                    zip_close(archive);
                    return { false, "Failed to create directory: " + final_dest_path.parent_path().string() };
                }

                // Open zip file
                zip_file_t* zf = zip_fopen_index(archive, i, 0);
                if (!zf)
                {
                    zip_close(archive);
                    return { false, "Failed to open zip entry: " + zip_entry_name };
                }

                // Open disk file
                std::ofstream outfile(final_dest_path, std::ios::binary);
                if (!outfile.is_open())
                {
                    zip_fclose(zf);
                    zip_close(archive);
                    return { false, "Failed to create output file: " + final_dest_path.string() };
                }

                // Write data
                zip_int64_t bytes_read = 0;
                while ((bytes_read = zip_fread(zf, buffer.data(), BUFFER_SIZE)) > 0)
                {
                    outfile.write(buffer.data(), bytes_read);
                }

                outfile.close();
                zip_fclose(zf);

                // Break the inner loop (entries map) so we don't extract the same file twice 
                // if multiple rules overlap.
                break;
            }
        }
    }

    if (zip_close(archive) < 0)
    {
        return { false, "Failed to close zip archive." };
    }

    return { true, "" };
}

inline std::pair<std::vector<std::string>, std::string> list_zip_content(const std::string& zip_filename)
{
    int error_code = 0;
    // Open in Read-Only mode
    zip_t* archive = zip_open(zip_filename.c_str(), ZIP_RDONLY, &error_code);

    if (!archive)
    {
        zip_error_t ziperror;
        zip_error_init_with_code(&ziperror, error_code);
        std::string msg = "Failed to open zip: " + std::string(zip_error_strerror(&ziperror));
        zip_error_fini(&ziperror);
        return { {}, msg };
    }

    // Get the total number of entries (files + folders)
    zip_int64_t num_entries = zip_get_num_entries(archive, 0);

    std::vector<std::string> entries;
    entries.reserve(num_entries); // Optimize memory allocation

    for (zip_int64_t i = 0; i < num_entries; ++i)
    {
        // Get the name of the file at index 'i'
        const char* name = zip_get_name(archive, i, 0);

        if (name)
        {
            entries.emplace_back(name);
        }
    }

    // Close the archive
    if (zip_close(archive) < 0)
    {
        return { {}, "Failed to close zip archive." };
    }

    return { entries, "" };
}

inline std::vector<std::string> split_path(const std::string& path)
{
    std::vector<std::string> tokens;
    std::string token;
    std::istringstream tokenStream(path);
    while (std::getline(tokenStream, token, '/'))
    {
        if (!token.empty())
        {
            tokens.push_back(token);
        }
    }
    return tokens;
}

inline nlohmann::json node_to_json(const FileNode* node)
{
    nlohmann::json j;
    j["data"] = node->name;

    if (!node->children.empty())
    {
        j["children"] = nlohmann::json::array();
        for (const auto& [key, child_ptr] : node->children)
        {
            j["children"].push_back(node_to_json(child_ptr.get()));
        }
    }
    return j;
}
inline nlohmann::json build_file_tree_json(const std::vector<std::string>& file_list) {
    FileNode root;
    root.name = "root"; 

    for (const auto& path : file_list) {
        std::vector<std::string> parts = split_path(path);
        
        FileNode* current = &root;
        
        for (const auto& part : parts) {
            if (current->children.find(part) == current->children.end()) {
                auto new_node = std::make_unique<FileNode>();
                new_node->name = part;
                current->children[part] = std::move(new_node);
            }
            current = current->children[part].get();
        }
    }

    nlohmann::json result = nlohmann::json::array();
    for (const auto& [key, child_ptr] : root.children) {
        result.push_back(node_to_json(child_ptr.get()));
    }

    return result;
}
inline nlohmann::json folder_to_json(const fs::path& path, const std::string& alias)
{
    nlohmann::json j;

    if (fs::exists(path))
    {
        j["data"] = alias.length() > 0 ? alias : path.filename().string();

        if (fs::is_directory(path))
        {
            nlohmann::json c = nlohmann::json::array();
            for (const auto& entry : fs::directory_iterator(path))
            {
                c.push_back(folder_to_json(entry, ""));
            }
            
            if (!c.empty())
            {
                j["children"] = c;
            }
        }
    }

    return j;
}

inline std::string open_file_win32()
{
    char buffer[8192] = { 0 };  // allocate buffer for multiple file names

    constexpr const char* filter = "Projection Files (*.xpr)\0*.xpr\0\0";

    OPENFILENAMEA ofn = { 0 };
    ofn.lStructSize = sizeof(ofn);
    ofn.hwndOwner = nullptr;
    ofn.lpstrFilter = filter;
    ofn.lpstrFile = buffer;
    ofn.nMaxFile = sizeof(buffer);
    ofn.Flags = OFN_EXPLORER | OFN_FILEMUSTEXIST;
    ofn.lpstrTitle = "Select projection file";

    if (GetOpenFileNameA(&ofn))
    {
        std::string file = buffer;
        return file;
    }

    return "";
}
inline std::string save_file_win32()
{
    char buffer[8192] = { 0 };  // allocate buffer for multiple file names

    constexpr const char* filter = "Projection Files (*.xpr)\0*.xpr\0\0";

    OPENFILENAMEA ofn = { 0 };
    ofn.lStructSize = sizeof(ofn);
    ofn.hwndOwner = nullptr;
    ofn.lpstrFilter = filter;
    ofn.lpstrDefExt = "xpr";
    ofn.lpstrFile = buffer;
    ofn.nMaxFile = sizeof(buffer);
    ofn.Flags = OFN_EXPLORER | OFN_FILEMUSTEXIST;
    ofn.lpstrTitle = "Select projection file";

    if (GetSaveFileNameA(&ofn))
    {
        std::string file = buffer;
        return file;
    }

    return "";
}
inline std::string GetAppDir()
{
    DWORD path_buffer_size = MAX_PATH;
    std::unique_ptr<CHAR[]> path_buf{ new CHAR[path_buffer_size] };

    while (true)
    {
        const auto bytes_written = GetModuleFileName(NULL, path_buf.get(), path_buffer_size);
        const auto last_error = GetLastError();

        if (bytes_written == 0)
        {
            return std::string{};
        }

        if (last_error == ERROR_INSUFFICIENT_BUFFER)
        {
            path_buffer_size *= 2;
            path_buf.reset(new CHAR[path_buffer_size]);
            continue;
        }

        auto path = std::string{ path_buf.get() };
        if (auto found = path.find_last_of("/\\"); found != std::string::npos)
        {
            path = path.substr(0, found);
        }

        return path;
    }
}

std::string execute_command_hidden(std::string const& cmd, std::string const& workingDir = "")
{
    std::string result;
    HANDLE hPipeRead, hPipeWrite;

    SECURITY_ATTRIBUTES saAttr;
    saAttr.nLength = sizeof(SECURITY_ATTRIBUTES);
    saAttr.bInheritHandle = TRUE;
    saAttr.lpSecurityDescriptor = NULL;

    if (!CreatePipe(&hPipeRead, &hPipeWrite, &saAttr, 0)) return "Error: Pipe failed";
    if (!SetHandleInformation(hPipeRead, HANDLE_FLAG_INHERIT, 0)) return "Error: Handle set failed";

    STARTUPINFOA si;
    PROCESS_INFORMATION pi;

    ZeroMemory(&si, sizeof(si));
    si.cb = sizeof(si);
    si.dwFlags |= STARTF_USESTDHANDLES | STARTF_USESHOWWINDOW;
    si.hStdOutput = hPipeWrite;
    si.hStdError = hPipeWrite;
    si.wShowWindow = SW_HIDE;

    ZeroMemory(&pi, sizeof(pi));

    std::vector<char> cmdBuffer(cmd.begin(), cmd.end());
    cmdBuffer.push_back(0);

    const char* lpCurrentDirectory = workingDir.empty() ? NULL : workingDir.c_str();

    BOOL bSuccess = CreateProcessA(
        NULL,
        cmdBuffer.data(),
        NULL,
        NULL,
        TRUE,
        0,
        NULL,
        lpCurrentDirectory,
        &si,
        &pi
    );

    CloseHandle(hPipeWrite);

    if (bSuccess)
    {
        DWORD dwRead;
        const int BUFFER_SIZE = 4096;
        char chBuf[BUFFER_SIZE];

        while (true)
        {
            if (!ReadFile(hPipeRead, chBuf, BUFFER_SIZE - 1, &dwRead, NULL) || dwRead == 0) break;
            chBuf[dwRead] = 0;
            result += chBuf;
        }

        WaitForSingleObject(pi.hProcess, INFINITE);
        CloseHandle(pi.hProcess);
        CloseHandle(pi.hThread);
    }
    else
    {
        result = "Error: Failed to create process (" + std::to_string(GetLastError()) + ")";
    }

    CloseHandle(hPipeRead);
    return result;
}
void run_command_async(std::string const& cmd, std::string const& dir, std::function<void(std::string)> callback)
{
    std::thread worker([cmd, dir, callback]()
    {
        std::string output = execute_command_hidden(cmd, dir);
        callback(output);
    });

    worker.detach();
}