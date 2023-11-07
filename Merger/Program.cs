using System.IO;
using System.Text.RegularExpressions;
class Program
{
    static readonly string[] InlineElements = { "span", "input", "label", "button", "br", "wbr", "a" };
    static readonly Regex InlineElementSpaceWrapper_0 = new Regex($@"(?<=>)(\s*)   (</?(?:{string.Join("|", InlineElements)})[^>]*>)");
    static readonly Regex InlineElementSpaceWrapper_1 = new Regex($@"(</?(?:{string.Join("|", InlineElements)})[^>]*>)(\s*)   (?=<)");
    static void Main(string[] args)
    {
        string html = File.ReadAllText("base.html");
        string js = File.ReadAllText("base.js");

        html = InlineElementSpaceWrapper_0.Replace(html, @"<!--$1-->$2");
        html = InlineElementSpaceWrapper_1.Replace(html, @"$1<!--$2-->");

        string target = Path.Combine(args.Length == 0 ? "./" : args[0], "user.js");

        File.WriteAllText(target, js.Replace("$$$$$replace$$$$$", html));
    }
}