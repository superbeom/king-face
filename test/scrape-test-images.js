const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const https = require("https");

/**
 * 테스트용 연예인 리스트 (남성 10명, 여성 10명)
 */
const CELEBRITIES = [
    // 남성 연예인
    "유재석", "지드래곤", "손흥민", "차은우", "공유",
    "BTS 뷔", "이민호", "정우성", "박서준", "이병헌",
    // 여성 연예인
    "아이유", "블랙핑크 제니", "수지", "송혜교", "김혜수",
    "한소희", "김태리", "전지현", "임윤아", "에스파 카리나"
];

const DOWNLOAD_DIR = path.join(__dirname, "images");
const IMAGES_PER_PERSON = 10;

async function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on("error", reject)
                    .on("close", resolve);
            } else {
                res.resume();
                reject(new Error(`Request Failed With Status Code: ${res.statusCode}`));
            }
        });
    });
}

async function scrapeImages() {
    if (!fs.existsSync(DOWNLOAD_DIR)) {
        fs.mkdirSync(DOWNLOAD_DIR);
    }

    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    for (const name of CELEBRITIES) {
        console.log(`\n🔎 Scraping images for: ${name}...`);
        const personDir = path.join(DOWNLOAD_DIR, name);
        if (!fs.existsSync(personDir)) {
            fs.mkdirSync(personDir);
        }

        try {
            // Google 이미지 검색
            const query = encodeURIComponent(`${name} 얼굴`);
            await page.goto(`https://www.google.com/search?q=${query}&tbm=isch`, {
                waitUntil: "networkidle2"
            });

            // 이미지 URL 추출
            const imageUrls = await page.evaluate((maxCount) => {
                const imgs = Array.from(document.querySelectorAll('img'));
                return imgs
                    .map(img => img.src || img.dataset.src || img.dataset.iurl)
                    .filter(src => src && src.startsWith('http'))
                    .slice(0, maxCount);
            }, IMAGES_PER_PERSON);

            console.log(`  - Found ${imageUrls.length} potential image URLs`);

            for (let i = 0; i < imageUrls.length; i++) {
                const ext = imageUrls[i].includes("webp") ? "webp" : "jpg";
                const filepath = path.join(personDir, `${i + 1}.${ext}`);

                try {
                    await downloadImage(imageUrls[i], filepath);
                    console.log(`  - [${i + 1}/${imageUrls.length}] Downloaded`);
                } catch (err) {
                    console.error(`  - [${i + 1}] Skip (Error: ${err.message})`);
                }
            }
        } catch (error) {
            console.error(`❌ Failed to scrape ${name}: ${error.message}`);
        }
    }

    await browser.close();
    console.log("\n✅ Scraping Completed!");
}

scrapeImages();
