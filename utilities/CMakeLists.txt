cmake_minimum_required(VERSION 3.16)
project(utilities LANGUAGES C CXX)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin")
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/lib")
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/lib")

include(FetchContent)

FetchContent_Declare(
    webview
    GIT_REPOSITORY https://github.com/webview/webview
    GIT_TAG 0.12.0)
FetchContent_MakeAvailable(webview)

set(WIL_BUILD_TESTS FALSE)
FetchContent_Declare(WIL
    URL https://github.com/microsoft/wil/archive/refs/tags/v1.0.250325.1.zip)
FetchContent_MakeAvailable(WIL)

FetchContent_Declare(
    libzip
    GIT_REPOSITORY https://github.com/nih-at/libzip
    GIT_TAG v1.11.4)
FetchContent_MakeAvailable(libzip)

add_executable(utilities WIN32)
target_sources(utilities PRIVATE main.cc "mongoose.h" "mongoose.c" "utilities.h" "bind.h" "json.hpp" "resources.rc" "resource.h")
target_link_libraries(utilities PRIVATE webview::core)
target_link_libraries(utilities PUBLIC WIL)
target_link_libraries(utilities PRIVATE libzip::zip)