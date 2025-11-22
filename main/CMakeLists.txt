cmake_minimum_required(VERSION 3.16)
project(projection LANGUAGES C CXX)

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

add_executable(projection WIN32)
target_sources(projection PRIVATE main.cc "utilities.h")
target_link_libraries(projection PRIVATE webview::core)
target_link_libraries(projection PUBLIC WIL)