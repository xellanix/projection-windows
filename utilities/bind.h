#pragma once
#include <string>
#include "utilities.h"

inline std::string filepath = "";
inline std::string projection = fs::path(GetAppDir()).parent_path().parent_path().string();

inline std::string importProjection(std::string const&)
{
	filepath = open_file_win32();
    if (filepath.empty()) return std::string("\"\"");

    auto [file_list, error_msg] = list_zip_content(filepath);

    if (!error_msg.empty())
    {
        return nlohmann::json(error_msg).dump();
    }

    nlohmann::json tree_structure = build_file_tree_json(file_list);
    
    return tree_structure.dump();
}

inline std::string extract(std::string const&)
{
    std::vector<ZipEntry> extract_map = {
        { projection + "/public/__temp", "public" },
        { projection + "/src/data/__temp", "data" }
    };
    
    for (const auto& e : extract_map)
    {
        if (!fs::exists(e.source_path)) continue;

        fs::rename(e.source_path, e.source_path + "2");
    }

    auto result = extract_mapped_zip_archive(filepath, extract_map);

    if (result.first)
    {
        for (const auto& e : extract_map)
        {
            const auto target = e.source_path + "2";
            if (!fs::exists(target)) continue;

            fs::remove_all(target);
        }

        return nlohmann::json("Success").dump();
    }
    else
    {
        for (const auto& e : extract_map)
        {
            const auto target = e.source_path + "2";
            if (!fs::exists(target)) continue;

            fs::rename(target, e.source_path);
        }

        return nlohmann::json(result.second).dump();
    }
}

inline std::string exportProjection(std::string const&)
{
    nlohmann::json json = nlohmann::json::array();
    
    std::array<ZipEntry, 2> targets = { {
        { projection + "/src/data/__temp", "data" },
        { projection + "/public/__temp", "public" }
    } };
    for (const auto& [source, alias] : targets)
    {
        if (!fs::exists(source) || !fs::is_directory(source)) continue;

        json.push_back(folder_to_json(source, alias));
    }

    return json.dump();
}

inline std::string compress(std::string const&)
{
    const auto res = save_file_win32();

    std::vector<ZipEntry> entries = {
        { projection + "/public/__temp", "public" },
        { projection + "/src/data/__temp", "data" }
    };
    auto result = create_zip_archive(res, entries);
    if (result.first)
    {
        return nlohmann::json("Success").dump();
    }
    else
    {
        return nlohmann::json(result.second).dump();
    }
}
