#pragma once
#include <string>
#include <Windows.h>
#include <memory>

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
