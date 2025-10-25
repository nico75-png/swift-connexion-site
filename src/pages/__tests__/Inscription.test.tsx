import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";

import Inscription from "../Inscription";

vi.mock("@/providers/AuthProvider", () => ({
  useAuthProfile: () => ({
    refreshProfile: vi.fn(),
  }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithOAuth: vi.fn(),
      signUp: vi.fn(),
      getSession: vi.fn(async () => ({
        data: { session: null },
      })),
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      })),
    },
  },
}));

vi.mock("@/lib/api/profiles", () => ({
  upsertProfile: vi.fn(),
}));

const renderMarkup = () =>
  renderToStaticMarkup(
    <MemoryRouter>
      <Inscription />
    </MemoryRouter>,
  );

describe("Inscription layout", () => {
  it("renders all required field controls", () => {
    const markup = renderMarkup();

    expect(markup).toContain('name="fullName"');
    expect(markup).toContain('name="username"');
    expect(markup).toContain('name="phone"');
    expect(markup).toContain('name="password"');
    expect(markup).toContain('id="acceptTerms"');
    expect(markup).toContain('role="combobox"');
  });

  it("keeps scroll affordance classes in the form panel", () => {
    const markup = renderMarkup();
    const scrollAreaMatch = markup.match(/<div[^>]*data-testid="registration-form-scroll-area"[^>]*>/i);
    const shellMatch = markup.match(/<div[^>]*data-testid="registration-shell"[^>]*>/i);

    expect(scrollAreaMatch).toBeTruthy();
    const scrollClasses = scrollAreaMatch?.[0]?.match(/class="([^"]*)"/i)?.[1]?.split(/\s+/).filter(Boolean) ?? [];
    expect(scrollClasses).toContain("overflow-y-auto");

    expect(shellMatch).toBeTruthy();
    const shellClasses = shellMatch?.[0]?.match(/class="([^"]*)"/i)?.[1]?.split(/\s+/).filter(Boolean) ?? [];
    expect(shellClasses).not.toContain("overflow-hidden");
    expect(shellClasses).toContain("lg:overflow-hidden");
  });

  it("exposes the sign-in helper link", () => {
    const markup = renderMarkup();

    expect(markup).toContain("Déjà inscrit ?");
    expect(markup).toContain('href="/auth"');
  });
});
