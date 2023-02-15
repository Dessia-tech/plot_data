export function htmlWriter(html: string, core_path: string, data: any) {
    html = html.replace("$data", JSON.stringify(data));
    html = html.replace("$core_path", core_path);
    return html
}
