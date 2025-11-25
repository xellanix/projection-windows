#include "webview/webview.h"
#include "mongoose.h"
#include <wil/com.h>
#include "utilities.h"
#include "bind.h"
#include <shellapi.h>
#include "resource.h"

#include <iostream>
#include <random>

#ifdef NDEBUG
constexpr auto DEBUG = false;
#else 
constexpr auto DEBUG = true;
#endif // NDEBUG

std::atomic<bool> keep_running = true;
std::atomic<int> global_port = 0;
void start_mongoose_server()
{
    struct mg_mgr mgr;
    mg_mgr_init(&mgr);

    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> distrib(8000, 65535);

    struct mg_connection* c = NULL;
    int port = 0;
    int attempts = 0;
    const int MAX_ATTEMPTS = 100;

    while (c == NULL && attempts < MAX_ATTEMPTS)
    {
        port = distrib(gen);
        std::string address = "http://localhost:" + std::to_string(port);

        c = mg_http_listen(&mgr, address.c_str(), [](struct mg_connection* c, int ev, void* ev_data)
        {
            if (ev == MG_EV_HTTP_MSG)
            {
                struct mg_http_message* hm = (struct mg_http_message*)ev_data;
                struct mg_http_serve_opts opts = { .root_dir = "dist" };
                mg_http_serve_dir(c, hm, &opts);
            }
        }, NULL);

        if (c == NULL) attempts++;
    }

    if (c == NULL)
    {
        MessageBox(NULL, "Failed to find an available port!", "Xellanix Projection Utility", MB_OK);
        mg_mgr_free(&mgr);
        return;
    }

    global_port = port;

    // 4. Main Event Loop
    while (keep_running)
    {
        mg_mgr_poll(&mgr, 100);
    }

    mg_mgr_free(&mgr);
}

void initWebView(webview::webview& w)
{
    wil::com_ptr<ICoreWebView2Controller> controller(static_cast<ICoreWebView2Controller*>(w.browser_controller().value()));
    controller->put_ZoomFactor(1.5);

    wil::com_ptr<ICoreWebView2Settings3> settings;
    {
        wil::com_ptr<ICoreWebView2> widget;
        controller->get_CoreWebView2(&widget);
        wil::com_ptr<ICoreWebView2Settings> temp;
        widget->get_Settings(&temp);

        settings = temp.try_query<ICoreWebView2Settings3>();
    }
    settings->put_IsZoomControlEnabled(TRUE);
    settings->put_AreDefaultContextMenusEnabled(FALSE);
    settings->put_AreDevToolsEnabled(FALSE);
    settings->put_IsStatusBarEnabled(FALSE);
}

#ifdef _WIN32
int WINAPI WinMain(HINSTANCE hInst, HINSTANCE /*hPrevInst*/,
                   LPSTR /*lpCmdLine*/, int /*nCmdShow*/)
{
    #else
int main()
{
    #endif
    try
    {
        HWND hwnd = NULL;
        webview::webview w(DEBUG, nullptr);
        w.set_title("Xellanix Projection Utilities");
        w.set_size(480, 320, WEBVIEW_HINT_NONE);
        {
            hwnd = static_cast<HWND>(w.window().value());
            ShowWindow(hwnd, SW_MAXIMIZE);
            const auto icon = LoadIcon(hInst, MAKEINTRESOURCE(IDI_APP_ICON));
            SendMessage(hwnd, WM_SETICON, ICON_BIG, (LPARAM)icon);
            SendMessage(hwnd, WM_SETICON, ICON_SMALL, (LPARAM)icon);
        }
        ShowWindow(static_cast<HWND>(w.window().value()), SW_MAXIMIZE);
        initWebView(w);

        w.bind("importProjection", importProjection);
        w.bind("extract", extract);
        w.bind("build", [&](const std::string& id, const std::string&, void* /*arg*/)
        {
            run_command_async("bun run build", "D:\\Beta Projects\\GitHub\\projection-next", [&, id](std::string result)
            {
                if (result.find("error: script \"build\"") != std::string::npos)
                {
                    auto start = result.find("Failed to compile.");
                    if (start == std::string::npos) start = 0;
                    w.resolve(id, 0, nlohmann::json(result.substr(start)).dump());
                    return;
                }
                else if (result.find("Error:") != std::string::npos)
                {
                    w.resolve(id, 0, nlohmann::json(result).dump());
                    return;
                }

                w.resolve(id, 0, nlohmann::json("Success").dump());
            });
        }, nullptr);
        w.bind("exportProjection", exportProjection);
        w.bind("pack", compress);
        w.bind("closeApp", [&](std::string const&) -> std::string
        {
            SendMessage(hwnd, WM_CLOSE, 0, 0);
            return "";
        });
        w.bind("closeAndStart", [&](std::string const&) -> std::string
        {
            std::string parameters = "-ExecutionPolicy Bypass -File \"";
            parameters += projection + "/windows/start.ps1";
            parameters += "\"";

            HINSTANCE result = ShellExecute(
                NULL,
                "open",
                "powershell.exe",
                parameters.c_str(),
                projection.c_str(),
                SW_SHOW
            );

            SendMessage(hwnd, WM_CLOSE, 0, 0);
            return "";
        });

        std::thread server_thread(start_mongoose_server);

        while (global_port == 0)
        {
            std::this_thread::sleep_for(std::chrono::milliseconds(50));
        }

        w.navigate("http://localhost:" + std::to_string(global_port));
        w.run();

        keep_running = false;
        server_thread.join();
    }
    catch (const webview::exception& e)
    {
        std::cerr << e.what() << '\n';
        return 1;
    }

    return 0;
}