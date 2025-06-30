import axios from 'axios';
import notifier from "node-notifier";

const urls = [
    {url: "https://classes.uwaterloo.ca/cgi-bin/cgiwrap/infocour/salook.pl?level=under&sess=1251&subject=CLAS&cournum=202", text: "CLAS202"},
    {url: "https://classes.uwaterloo.ca/cgi-bin/cgiwrap/infocour/salook.pl?level=under&sess=1251&subject=CLAS&cournum=205", text: "CLAS205"},
    {url: "https://classes.uwaterloo.ca/cgi-bin/cgiwrap/infocour/salook.pl?level=under&sess=1251&subject=CLAS&cournum=252", text: "CLAS252"},
    {url: "https://classes.uwaterloo.ca/cgi-bin/cgiwrap/infocour/salook.pl?level=under&sess=1251&subject=PHIL&cournum=145", text: "PHIL145"},
    {url: "https://classes.uwaterloo.ca/cgi-bin/cgiwrap/infocour/salook.pl?level=under&sess=1251&subject=HEALTH&cournum=105", text: "HEALTH105"},
    {url: "https://classes.uwaterloo.ca/cgi-bin/cgiwrap/infocour/salook.pl?level=under&sess=1251&subject=HEALTH&cournum=100", text: "HEALTH100"},
    {url: "https://classes.uwaterloo.ca/cgi-bin/cgiwrap/infocour/salook.pl?level=under&sess=1251&subject=HIST&cournum=216", text: "HIST216"}
];

class WatcherObject {
    private lastData: string|null = null;
    private url: string;
    private alertText: string;
    private timeFormatter = Intl.DateTimeFormat("en-CA", { timeStyle: "medium", dateStyle: "short" });
    constructor(url: string, alertText: string) {
        this.url = url;
        this.alertText = alertText;
    }
    public async check() {
        const date = new Date();
        console.log(`[${this.timeFormatter.format(date)}] Checking ${this.alertText}`);
        await axios.get(this.url)
        .then(async (response) => {
            const text = response.data;
            if (this.lastData !== null) {
                if (this.lastData !== text) {
                    console.log(`Change Detected! ${this.alertText}`);
                    notifier.notify({
                        title: "Website Change!",
                        message: this.alertText,
                        
                    });
                }
            }
            this.lastData = text;
        })
        .catch(error => {
            console.log(error);
        });
    }
};

const sleep = async (timeout: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, timeout * 1000));
}

const run = async () => {
    const cooldown = 30; // Seconds
    const watchers = urls.map((url) => new WatcherObject(url.url, url.text));
    while (true) {
        for await (const watcher of watchers) {
            await watcher.check();
            await sleep(cooldown / watchers.length);
        }
    }
}
run();
