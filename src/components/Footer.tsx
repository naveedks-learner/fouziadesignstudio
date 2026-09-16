export default function Footer() {
  return (
    <footer className="mt-20 border-t-2 border-accent bg-accent-soft">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-serif text-lg text-accent">
              Fouzia Design Studio
            </p>
            <p className="mt-2 text-sm text-stone-600">
              Bespoke Indian &amp; western wear, crafted with care.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-900">Contact</p>
            <p className="mt-2 text-sm text-stone-600">
              Phone: +91 98807 88885
              <br />
              Email: fouzian22@gmail.com
              <br />
              Studio: Bengaluru, India
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-900">Follow</p>
            <p className="mt-2 text-sm text-stone-600">
              <a
                href="https://www.instagram.com/fouziadesignstudio/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent"
              >
                Instagram
              </a>{" "}
              &middot;{" "}
              <a
                href="https://www.facebook.com/search/top?q=fouzia%20design%20studio"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent"
              >
                Facebook
              </a>
            </p>
          </div>
        </div>
        <p className="mt-8 text-xs text-stone-500">
          &copy; {new Date().getFullYear()} Fouzia Design Studio. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
