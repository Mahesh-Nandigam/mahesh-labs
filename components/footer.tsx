import Image from "next/image";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-main">
        <a href="/" className="brand" aria-label="MaheshLabs home">
          <Image
            src="/assets/logo-light.svg"
            width={194}
            height={35}
            alt="MaheshLabs"
          />
        </a>
        <p>Good questions. Real journeys.</p>
        <div>
          <a
            href="https://www.youtube.com/@MAHESHNANDIGAM-t9z"
            target="_blank"
            rel="noopener"
          >
            YouTube
          </a>
          <a href="https://x.com/mahesh_labs" target="_blank" rel="noopener">
            X / Twitter
          </a>
          <a href="/blog/">Blog</a>
          <a href="/#connect">Get in touch</a>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>
          © <span>{new Date().getFullYear()}</span> MaheshLabs
        </span>
        <span>Made by two friends. For curious minds.</span>
        <a href="/">Back to top</a>
      </div>
    </footer>
  );
}
