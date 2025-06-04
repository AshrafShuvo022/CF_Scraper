import './globals.css';

export const metadata = {
  title: 'Codeforces CSV App',
  description: 'Download filtered problem CSVs from Codeforces',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
