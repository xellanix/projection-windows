#include "webview/webview.h"
#include "utilities.h"
#include <wil/com.h>

#include <iostream>

#ifdef NDEBUG
constexpr auto DEBUG = false;
#else 
constexpr auto DEBUG = true;
#endif // NDEBUG

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
int WINAPI WinMain(HINSTANCE /*hInst*/, HINSTANCE /*hPrevInst*/,
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
        w.set_title("Xellanix Projection");
        w.set_size(480, 320, WEBVIEW_HINT_NONE);
        {
            hwnd = static_cast<HWND>(w.window().value());
            ShowWindow(hwnd, SW_MAXIMIZE);
            /*const auto icon = LoadIcon(hInst, MAKEINTRESOURCE(IDI_EXAMPLE));
            SendMessage(hwnd, WM_SETICON, ICON_BIG, (LPARAM)icon);
            SendMessage(hwnd, WM_SETICON, ICON_SMALL, (LPARAM)icon);*/
        }
        ShowWindow(static_cast<HWND>(w.window().value()), SW_MAXIMIZE);
        initWebView(w);

        w.navigate("http://localhost:3000/");

        w.run();
    }
    catch (const webview::exception& e)
    {
        std::cerr << e.what() << '\n';
        return 1;
    }

    return 0;
}