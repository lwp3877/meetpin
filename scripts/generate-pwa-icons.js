const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// PWA 아이콘 크기 목록
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// 아이콘 생성 함수
async function generateIcons() {
  const svgPath = path.join(__dirname, '..', 'public', 'icons', 'meetpin.svg');
  const outputDir = path.join(__dirname, '..', 'public', 'icons');

  // SVG 파일 읽기
  const svgBuffer = fs.readFileSync(svgPath);

  console.log('🎨 PWA 아이콘 생성 시작...\n');

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

    try {
      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 16, g: 185, b: 129, alpha: 1 } // #10b981 (emerald-500)
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ 생성 완료: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ 생성 실패: icon-${size}x${size}.png`, error.message);
    }
  }

  // Apple Touch Icon 생성 (180x180)
  try {
    const appleTouchIconPath = path.join(outputDir, 'apple-touch-icon.png');
    await sharp(svgBuffer)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 16, g: 185, b: 129, alpha: 1 }
      })
      .png()
      .toFile(appleTouchIconPath);

    console.log(`✅ 생성 완료: apple-touch-icon.png`);
  } catch (error) {
    console.error(`❌ 생성 실패: apple-touch-icon.png`, error.message);
  }

  // Favicon 생성 (32x32, 16x16)
  const faviconSizes = [16, 32];
  for (const size of faviconSizes) {
    const faviconPath = path.join(__dirname, '..', 'public', `favicon-${size}x${size}.png`);

    try {
      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 16, g: 185, b: 129, alpha: 1 }
        })
        .png()
        .toFile(faviconPath);

      console.log(`✅ 생성 완료: favicon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ 생성 실패: favicon-${size}x${size}.png`, error.message);
    }
  }

  console.log('\n🎉 모든 PWA 아이콘 생성 완료!');
}

// 실행
generateIcons().catch(console.error);
