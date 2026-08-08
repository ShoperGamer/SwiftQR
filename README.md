
<div align="center">
  <h1>SwiftQR: Modern, Real-Time & Offline-Ready QR Code Generator</h1>
  <p>An elegant, lightweight, and customizable QR Code generator built for speed, performance, and offline reliability.</p>
  <p>
    <img src="https://img.shields.io/badge/Status-Completed-brightgreen?style=for-the-badge&logo=github" alt="Status"/>
    <img src="https://img.shields.io/badge/Language-HTML5%2FCSS3%2FJavaScript-blue?style=for-the-badge&logo=javascript" alt="Language"/>
    <img src="https://img.shields.io/badge/Framework-Bootstrap_5-purple?style=for-the-badge&logo=bootstrap" alt="Framework"/>
    <img src="https://img.shields.io/badge/PWA-Offline--Ready-orange?style=for-the-badge&logo=pwa" alt="PWA"/>
    <img src="https://img.shields.io/badge/License-MIT-lightgrey?style=for-the-badge&logo=github" alt="License"/>
  </p>
</div>

---

## 🇬🇧 English: SwiftQR

**SwiftQR** is a high-performance, client-side web application for creating custom QR codes instantly. Built with a focus on UX/UI, modern performance standards, and offline usability, SwiftQR allows users to personalize QR code patterns, frame styles, center dots, and center logos in real-time.

### ✨ Key Features

* **⚡ Real-Time Live Preview:** Instant QR code rendering as you type or paste URLs, with debounced performance (150ms) optimized for smooth 60fps typing on mobile devices.
* **📶 100% Offline Support (PWA Service Worker):** Features a Service Worker (`sw.js`) with a *Network-First* caching strategy. Open it once, and it works seamlessly without an internet connection.
* **🎨 Rich Styling Options:**
  * **Pattern Shapes (Dots):** Square, Dots, Rounded, Extra-Rounded, Classy, and Classy-Rounded.
  * **Outer Frame Styles:** Square, Dot, Extra-Rounded.
  * **Inner Corner Styles:** Square, Dot.
  * **Custom Palette:** Full control over QR dots, background, and frame colors.
* **🖼️ Center Logo Integration:** Upload custom logos (PNG, JPG, SVG, WebP) with auto-scaling (20%–40%), background dot clearing, and automatic **Error Correction Level H (30%)** escalation to ensure maximum scan reliability.
* **🚀 Ultra-Lightweight & Fast:** 100% Inline SVG icons replace heavy font libraries, saving ~100KB in page weight and eliminating extra HTTP requests.
* **🌙 Dark Mode Support:** Seamless theme switching stored in local storage for a comfortable experience day or night.
* **💾 High-Res Download:** Save high-resolution PNG images with automated or custom filename support.

### 🛠️ Technologies Used

* **HTML5:** Semantic HTML structure with direct Inline SVG icons.
* **CSS3:** Custom responsive layout, CSS variables, and Dark Mode context styling.
* **JavaScript (ES6+):** Pure client-side logic, debounced input events, and Service Worker registration.
* **Bootstrap 5.3:** Modern responsive layout framework.
* **qr-code-styling:** Advanced SVG/Canvas vector QR code rendering library.

### 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/ShoperGamer/SwiftQR.git](https://github.com/ShoperGamer/SwiftQR.git)
2.  **Launch the app:**
    
    Open `index.html` directly in your web browser, or serve it via any static web server (e.g., Live Server in VS Code).
    
      
    

### 💡 How to Use

1.  **Enter Destination URL:** Type or paste your link into the "Destination URL" field to see live QR updates.
    
      
    
2.  **Customize Appearance:**
    
      
    -   Adjust dimensions (px) and margins.
        
          
        
    -   Pick custom colors for QR dots, background, and frame borders.
        
          
        
    -   Select your preferred shapes for dots, outer corners, and inner dots using the horizontal icon cards.
        
          
        
3.  **Add Logo (Optional):** Enable the "Center Logo" switch, upload your image file, and adjust logo sizing and padding.
    
      
    
4.  **Download:** Click **"Download High-Res Image"**, set your desired filename in the modal prompt, and save your PNG file.
    
      
    

## 🇹🇭 Thai: SwiftQR (เครื่องมือสร้าง QR Code สไตล์มินิมอล)

**SwiftQR** เป็นเว็บแอปพลิเคชันสำหรับสร้างและปรับแต่ง QR Code ที่เน้นความเรียบง่าย ประสิทธิภาพสูง และรองรับการทำงานแบบเรียลไทม์ ตัวระบบทำงานบนฝั่งผู้ใช้งาน (Client-Side) ทั้งหมด พร้อมรองรับการใช้งานแบบออฟไลน์ 100%

  

### ✨ คุณสมบัติหลัก

-   **⚡ แสดงผลเรียลไทม์ (Live Preview):** สแกนและสร้าง QR Code ทันทีทุกครั้งที่มีการพิมพ์หรือวาง URL พร้อมระบบ Debouncing (150ms) ป้องกันเครื่องกระตุกบนมือถือ
    
      
    
-   **📶 รองรับการใช้งานแบบออฟไลน์ (PWA Service Worker):** ฝังระบบ `sw.js` (Network-First Cache) เปิดใช้งานเว็บเพียงครั้งเดียวก็สามารถเปิดใช้งานต่อได้ทันทีแม้ไม่มีสัญญาณอินเทอร์เน็ต
    
      
    
-   **🎨 ตัวเลือกปรับแต่งดีไซน์ที่หลากหลาย:**
    
      
    -   **สไตล์รูปทรงจุด (Dots):** สี่เหลี่ยม, วงกลม/จุดไข่ปลา, มุมมน, มนพิเศษ, คลาสซี่เรียบหรู และคลาสซี่มุมมน
        
          
        
    -   **สไตล์เส้นขอบนอก (Outer Corners):** สี่เหลี่ยม, วงกลม, มุมมนพิเศษ
        
          
        
    -   **สไตล์เซ็นเตอร์ใน (Inner Dots):** สี่เหลี่ยม, วงกลม
        
          
        
    -   **ปรับแต่งโทนสี:** ปรับสีจุดลาย, สีพื้นหลัง และสีกรอบได้อย่างอิสระ
        
          
        
-   **🖼️ ใส่โลโก้ตรงกลาง:** รองรับการอัปโหลดรูปภาพ (PNG, JPG, SVG, WebP) ปรับขนาดสัดส่วน (20%–40%) พร้อมระบบสลับไปใช้ **Error Correction Level H (30%)** อัตโนมัติเพื่อให้สแกนติดง่ายและแม่นยำที่สุด
    
      
    
-   **🚀 โหลดไวกว่าด้วย Inline SVG:** ตัดการโหลดไฟล์ฟอนต์และ CSS ภายนอกที่ไม่จำเป็นออกทั้งหมด ช่วยลดขนาดหน้าเว็บลงได้กว่า 100KB
    
      
    
-   **🌙 Dark Mode:** สลับระหว่างโหมดสว่างและโหมดมืดอย่างลงตัว พร้อมบันทึกสถานะลงใน Local Storage
    
      
    
-   **💾 ดาวน์โหลดความละเอียดสูง:** บันทึกไฟล์ภาพ PNG ความละเอียดสูง พร้อมระบบตั้งชื่อไฟล์ให้อัตโนมัติ
    
      
    

### 🛠️ เทคโนโลยีที่ใช้

-   **HTML5:** โครงสร้างหลักเว็บเพจ ฝังไอคอน SVG Inline คมชัด
    
      
    
-   **CSS3:** ตกแต่งหน้าตาแบบมินิมอล ปรับแต่งตามธีม Dark Mode
    
      
    
-   **JavaScript (ES6+):** ควบคุมตรรกะการประมวลผลระบบเรียลไทม์ และระบบ Service Worker
    
      
    
-   **Bootstrap 5.3:** โครงสร้าง Grid Layout แบบ Responsive
    
      
    
-   **qr-code-styling:** ไลบรารีสำหรับประมวลผลและวาด QR Code เวกเตอร์ Canvas/SVG
    
      
    

### 🚀 การเริ่มต้นใช้งาน

1.  **โคลนโปรเจกต์:**
    
      
    
    Bash
    
    ```
    git clone [https://github.com/ShoperGamer/SwiftQR.git](https://github.com/ShoperGamer/SwiftQR.git)
    ```
    
2.  **เปิดใช้งาน:**
    
    เปิดไฟล์ `index.html` ผ่านเบราว์เซอร์ของคุณ หรือรันผ่าน Live Server บน VS Code
    
      
    

### 💡 วิธีใช้งาน

1.  **ใส่ลิงก์ปลายทาง:** วางหรือพิมพ์ URL ลงในช่อง "ลิงก์ปลายทาง (URL)" เพื่อดูตัวอย่าง QR Code ทันที
    
      
    
2.  **ปรับแต่งดีไซน์:**
    
      
    -   เลือกโทนสีของจุด QR, พื้นหลัง และสีกรอบ
        
          
        
    -   คลิกเลือกรูปแบบจุดลาย เส้นขอบ และจุดมุมผ่านปุ่มการ์ดไอคอนแนวนอน
        
          
        
3.  **ใส่โลโก้ตรงกลาง (ตัวเลือกเสริม):** เปิดสวิตช์ "ใส่รูปภาพ/โลโก้ตรงกลาง" อัปโหลดไฟล์รูปภาพ และปรับขนาดสัดส่วนตามต้องการ
    
      
    
4.  **ดาวน์โหลด:** กดปุ่ม **"ดาวน์โหลดภาพไฟล์ความละเอียดสูง"** ตั้งชื่อไฟล์ในหน้าต่าง Pop-up แล้วบันทึกภาพ PNG ได้ทันที
    
      
    

### 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://www.google.com/search?q=https://github.com/ShoperGamer/SwiftQR/issues&authuser=4).

  

### 📄 License

This project is licensed under the [MIT License](https://www.google.com/search?q=https://github.com/ShoperGamer/SwiftQR/blob/main/LICENSE&authuser=4).