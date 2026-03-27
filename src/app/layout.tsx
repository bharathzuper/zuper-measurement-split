import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/zuper-styles.scss";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
	title: "Zuper — Split Measurement Prototype",
	description: "PROD-766: Split Measurement feature design prototype for Zuper's roofing workflow",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
			<head>
				<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.34.0/dist/tabler-icons.min.css" />
			</head>
			<body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>{children}</body>
		</html>
	);
}
