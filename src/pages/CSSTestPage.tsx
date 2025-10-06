/**
 * CSS Diagnostic Test Page
 * Visit this page to verify Tailwind utilities are working
 */

export default function CSSTest() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-text-primary mb-4">
        CSS Diagnostic Test Page
      </h1>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-text-primary">
          1. Spacing Utilities Test
        </h2>
        <div className="space-y-spacing-sm bg-surface-secondary p-spacing-lg rounded-lg">
          <div className="p-spacing-xs bg-brand-primary text-white">
            p-spacing-xs (should have small padding)
          </div>
          <div className="p-spacing-sm bg-brand-primary text-white">
            p-spacing-sm (should have small-medium padding)
          </div>
          <div className="p-spacing-md bg-brand-primary text-white">
            p-spacing-md (should have medium padding)
          </div>
          <div className="p-spacing-lg bg-brand-primary text-white">
            p-spacing-lg (should have large padding)
          </div>
          <div className="p-spacing-xl bg-brand-primary text-white">
            p-spacing-xl (should have extra large padding)
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-text-primary">
          2. Surface Color Utilities Test
        </h2>
        <div className="space-y-spacing-sm">
          <div className="bg-surface-base p-spacing-md border border-border">
            bg-surface-base (white/light background)
          </div>
          <div className="bg-surface-secondary p-spacing-md text-text-primary">
            bg-surface-secondary (slightly darker)
          </div>
          <div className="bg-surface-card p-spacing-md text-text-primary">
            bg-surface-card (card background)
          </div>
          <div className="bg-surface-inverse p-spacing-md text-text-inverse">
            bg-surface-inverse (dark background, light text)
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-text-primary">
          3. Text Color Utilities Test
        </h2>
        <div className="bg-surface-secondary p-spacing-lg rounded-lg space-y-spacing-xs">
          <p className="text-text-primary">text-text-primary (main text)</p>
          <p className="text-text-secondary">
            text-text-secondary (secondary text)
          </p>
          <p className="text-text-muted">text-text-muted (muted text)</p>
          <p className="text-text-brand">text-text-brand (brand color)</p>
          <p className="text-text-error">text-text-error (error color)</p>
          <p className="text-text-success">text-text-success (success color)</p>
          <p className="text-text-warning">text-text-warning (warning color)</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-text-primary">
          4. Elevation/Shadow Utilities Test
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-spacing-lg">
          <div className="shadow-card bg-surface-secondary p-spacing-lg rounded-lg">
            shadow-card (card shadow)
          </div>
          <div className="shadow-button bg-surface-secondary p-spacing-lg rounded-lg">
            shadow-button (button shadow)
          </div>
          <div className="elevation-card bg-surface-secondary p-spacing-lg rounded-lg">
            elevation-card (hover to see effect)
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-text-primary">
          5. Gap Utilities Test
        </h2>
        <div className="bg-surface-secondary p-spacing-lg rounded-lg">
          <div className="flex gap-spacing-xs mb-spacing-md">
            <div className="bg-brand-primary text-white p-spacing-xs">1</div>
            <div className="bg-brand-primary text-white p-spacing-xs">2</div>
            <div className="bg-brand-primary text-white p-spacing-xs">3</div>
          </div>
          <div className="flex gap-spacing-md mb-spacing-md">
            <div className="bg-brand-primary text-white p-spacing-sm">1</div>
            <div className="bg-brand-primary text-white p-spacing-sm">2</div>
            <div className="bg-brand-primary text-white p-spacing-sm">3</div>
          </div>
          <div className="flex gap-spacing-lg">
            <div className="bg-brand-primary text-white p-spacing-md">1</div>
            <div className="bg-brand-primary text-white p-spacing-md">2</div>
            <div className="bg-brand-primary text-white p-spacing-md">3</div>
          </div>
        </div>
      </section>

      <div className="mt-8 p-spacing-lg bg-surface-card rounded-lg border border-border">
        <h3 className="font-bold text-text-primary mb-spacing-sm">
          ✅ If you can see proper styling above:
        </h3>
        <ul className="space-y-spacing-xs text-text-secondary">
          <li>• Spacing utilities are working (p-spacing-*, gap-spacing-*)</li>
          <li>• Surface colors are working (bg-surface-*)</li>
          <li>• Text colors are working (text-text-*)</li>
          <li>• Shadows/elevation are working</li>
        </ul>

        <h3 className="font-bold text-text-primary mt-spacing-md mb-spacing-sm">
          ❌ If the styles look broken:
        </h3>
        <ul className="space-y-spacing-xs text-text-secondary">
          <li>• Hard refresh browser (Cmd+Shift+R)</li>
          <li>• Check browser console for Tailwind errors</li>
          <li>• Clear Vite cache: rm -rf node_modules/.vite</li>
        </ul>
      </div>
    </div>
  );
}
