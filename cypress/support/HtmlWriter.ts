export function HtmlWriter(html: string, core_path: string, data: any, canvas_id: string) {
    html = html.replace("$data", JSON.stringify(data));
    html = html.replace("$core_path", core_path);
    html = html.replace(/$canvas_id/g, canvas_id);
    return html
}
