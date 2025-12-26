/* eslint-disable @typescript-eslint/no-require-imports */
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
      "--allow-running-insecure-content",
      "--disable-blink-features=AutomationControlled",
      "--ignore-certificate-errors",
      "--use-gl=angle",
      "--use-angle=gl",
      "--enable-webgl",
      "--enable-webgl2-compute-context",
      "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ],
  });
  const page = await browser.newPage();

  // Console logs from the browser to the node console
  page.on("console", async (msg) => {
    try {
      const args = await Promise.all(msg.args().map((arg) => arg.jsonValue()));
      if (
        args.length > 0 &&
        typeof args[0] === "string" &&
        args[0].includes("[HMR]")
      )
        return;
      console.log("PAGE LOG:", ...args);
    } catch (e) {
      // jsonValue() might fail for some complex objects
      console.log("PAGE LOG (raw):", msg.text());
    }
  });

  // const subjects = ['a', 'b', 'c', 'd', 'e'];
  const subjects = ['a', 'b', 'c', 'd', 'e'];
  const results = {};

  console.log("🚀 Starting Consistency Verification...");

  try {
    for (const subject of subjects) {
      results[subject] = [];
      console.log(`\nTesting Subject [${subject.toUpperCase()}]...`);

      for (let i = 1; i <= 3; i++) {
        const imageName = `${subject}-${i}.jpeg`;
        const imagePath = path.resolve(__dirname, "test-images", imageName);

        if (!fs.existsSync(imagePath)) {
          console.error(`File not found: ${imagePath}`);
          continue;
        }

        try {
          // 1. Go to page
          await page.goto("http://localhost:3000", {
            waitUntil: "load",
            timeout: 120000,
          });

          // 2. Wait for model loading (AI 모델 로딩 성공 로그를 기다리거나 충분한 시간 대기)
          // 여기서는 modelsLoaded 상태가 변할 때까지 대기하는 로직을 추가하는 것이 좋으나,
          // 간단히 파일 업로드 준비가 될 때까지 기다립니다.
          const inputSelector = 'input[type="file"]';
          await page.waitForSelector(inputSelector, { timeout: 20000 });

          // 3. Upload file
          const inputUploadHandle = await page.$(inputSelector);
          await inputUploadHandle.uploadFile(imagePath);

          // 4. Wait for analysis to complete (look for the Result Card header)
          const resultSelector = "h3.text-white.text-4xl.font-black";
          await page.waitForSelector(resultSelector, { timeout: 120000 });

          // 5. Extract text
          const jobTitle = await page.$eval(
            resultSelector,
            (el) => el.innerText
          );

          console.log(`  - Image ${i}: ${jobTitle}`);
          results[subject].push(jobTitle);
        } catch (error) {
          console.error(`  - Image ${i}: Error (${error.message})`);
          results[subject].push("ERROR");
        }
      }
    }

    console.log("\n==========================================");
    console.log("📊 FINAL REPORT");
    console.log("==========================================");

    let allPass = true;

    for (const subject of subjects) {
      const outcomes = results[subject];
      const validOutcomes = outcomes.filter((o) => o !== "ERROR");

      if (validOutcomes.length === 0) {
        console.log(`Subject ${subject.toUpperCase()}: ❌ FAIL (All Errors)`);
        allPass = false;
        continue;
      }

      const uniqueOutcomes = [...new Set(validOutcomes)];
      const isConsistent = uniqueOutcomes.length === 1 && outcomes.length === 3;
      const status = isConsistent ? "✅ PASS" : "❌ FAIL";

      if (!isConsistent) allPass = false;

      console.log(`Subject ${subject.toUpperCase()}: ${status}`);
      console.log(`   Results: [ ${outcomes.join(", ")} ]`);
    }

    console.log("==========================================");
    if (allPass) {
      console.log("🎉 SUCCESS: All subjects have consistent results!");
    } else {
      console.log(
        "⚠️ WARNING: Some subjects produced inconsistent results or errors."
      );
    }
  } catch (err) {
    console.error("Fatal Error:", err);
  } finally {
    await browser.close();
  }
})();
