export function htmlWriter(html: string, core_path: string) {
    return html.replace("$core_path", core_path)
}