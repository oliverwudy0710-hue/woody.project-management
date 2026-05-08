import { ASSISTANT_HELP_SECTIONS } from './assistantHelpSections'

export function AssistantHelpPanel() {
  return (
    <details className="rounded-xl border border-slate-200/90 bg-white/80 px-3 py-2 text-xs text-slate-700 shadow-sm">
      <summary className="cursor-pointer select-none font-semibold text-slate-800">助手能力说明（帮助文档）</summary>
      <div className="mt-2 space-y-3 border-t border-slate-100 pt-2">
        {ASSISTANT_HELP_SECTIONS.map((sec) => (
          <section key={sec.title}>
            <h3 className="font-semibold text-slate-900">{sec.title}</h3>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-slate-600">
              {sec.lines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </details>
  )
}
