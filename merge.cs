using System.IO;
class Program
{
    static void Main()
    {
        File.WriteAllText("user.js", File.ReadAllText("base.js").Replace("$$$$$replace$$$$$", File.ReadAllText("base.html")));
    }
}