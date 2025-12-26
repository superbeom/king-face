import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "내가 왕이 될 상인가!",
  description: "인공지능 관상가 양반이 봐주는 조선시대 내 직업 찾기",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >



        {/* TensorFlow.js Core & Converter */}
        <Script
          src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js"
          strategy="beforeInteractive"
        />
        {/* TensorFlow.js WASM Backend */}
        <Script
          src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@latest/dist/tf-backend-wasm.min.js"
          strategy="beforeInteractive"
        />
        {/* MediaPipe Face Mesh - Required for 'mediapipe' runtime */}
        <Script
          src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"
          strategy="beforeInteractive"
        />
        {/* MediaPipe Face Mesh (via TensorFlow Models) */}
        <Script
          src="https://cdn.jsdelivr.net/npm/@tensorflow-models/face-landmarks-detection/dist/face-landmarks-detection.min.js"
          strategy="beforeInteractive"
        />

        {children}
      </body>
    </html>
  );
}
