import { store } from "@/config/store";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface text-foreground">
      <div className="mx-auto max-w-300 px-4 py-8 md:px-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <span className="font-sans text-xl font-bold text-primary">
              {store.name}
            </span>
            <p className="mt-1 text-sm text-muted">
              Keripik talas dan rengginang untuk teman ngemil.
            </p>
          </div>

          <div className="text-sm text-muted space-y-1">
            <p>
              <strong className="text-foreground">WhatsApp:</strong>{" "}
              <a
                href={`https://wa.me/${store.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                {store.whatsappDisplay}
              </a>
            </p>
            <p>
              <strong className="text-foreground">Instagram:</strong> {store.instagram}
            </p>
            <p>
              <strong className="text-foreground">Alamat:</strong> {store.address}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-border text-xs text-muted">
          <p>&copy; {new Date().getFullYear()} {store.name}.</p>
        </div>
      </div>
    </footer>
  );
}
