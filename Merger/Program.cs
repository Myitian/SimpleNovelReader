using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;
class Program
{
    const string USER_SCRIPT_END = "==/UserScript==\n";
    static readonly string[] InlineElements = { "span", "input", "label", "button", "br", "wbr", "a" };
    static readonly string InlineElementsOr = string.Join("|", InlineElements);
    static readonly Regex InlineElementSpaceWrapper_0 = new Regex($@"(?<=>)(\s*)   (</?(?:{InlineElementsOr})[^>]*>)");
    static readonly Regex InlineElementSpaceWrapper_1 = new Regex($@"(</?(?:{InlineElementsOr})[^>]*>)(\s*)   (?=<)");
    static readonly Regex MetadataHeader = new Regex(@"\s*//\s+@match\s+(.+)");
    static void Main(string[] args)
    {
        string html = File.ReadAllText("base.html");
        string js = File.ReadAllText("base.js");

        html = InlineElementSpaceWrapper_0.Replace(html, "<!--$1-->$2");
        html = InlineElementSpaceWrapper_1.Replace(html, "$1<!--$2-->");

        string target = Path.Combine(args.Length == 0 ? "./" : args[0], "user.js");

        MatchCollection matches = MetadataHeader.Matches(js);
        List<string> pageRegex = new List<string>(matches.Count);
        foreach (Match m in matches)
        {
            pageRegex.Add(m.Groups[1].Value.Replace("/", "\\/").Replace(".", "\\.").Replace("*", ".*"));
        }
        int userScriptEnd = js.IndexOf(USER_SCRIPT_END) + USER_SCRIPT_END.Length;
        js = js.Insert(userScriptEnd, "\nconst PageRegex = [\n    /" + string.Join("/,\n    /", pageRegex) + "/\n];\n");

        File.WriteAllText(target, js.Replace("$$$$$replace$$$$$", html));
    }
}