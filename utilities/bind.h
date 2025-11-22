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
    auto result = extract_mapped_zip_archive(filepath, extract_map);

    if (result.first)
    {
        return nlohmann::json("Success").dump();
    }
    else
    {
        return nlohmann::json(result.second).dump();
    }
}

inline std::string compress(std::string const&)
{
    std::vector<ZipEntry> entries = {
        { projection + "/public/__temp", "public" },
        { projection + "/src/data/__temp", "data" }
    };
    auto result = create_zip_archive(GetAppDir() + "/output.xpr", entries);
    if (result.first)
    {
        return nlohmann::json("Success").dump();
    }
    else
    {
        return nlohmann::json(result.second).dump();
    }
}
