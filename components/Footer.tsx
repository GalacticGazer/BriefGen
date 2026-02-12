export default function Footer() {
  return (
    <footer className="border-t border-gray-200 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} BriefGen.ai</p>
        <p>Secure checkout by Stripe. Reports delivered as downloadable PDFs.</p>
      </div>
    </footer>
  );
}
