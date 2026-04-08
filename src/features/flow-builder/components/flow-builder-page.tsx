import { ReactFlowProvider } from 'reactflow'
import { FlowBuilderHeader } from './flow-builder-header'
import { FlowCanvas } from './flow-canvas'
import { NodeSidebar } from './node-sidebar'
import { PropertiesPanel } from './properties-panel'
import { ValidationBanner } from './validation-banner'

export function FlowBuilderPageView() {
  return (
    <ReactFlowProvider>
      <div className="space-y-4">
        <FlowBuilderHeader />
        <ValidationBanner />

        <section className="grid gap-4 xl:grid-cols-[300px_1fr]">
          <div className="min-h-[520px]">
            <NodeSidebar />
          </div>
          <FlowCanvas />
        </section>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-1)_92%,transparent),color-mix(in_srgb,var(--surface-2)_90%,transparent))] p-1 shadow-[var(--shadow-soft)] backdrop-blur-sm">
          <PropertiesPanel />
        </div>
      </div>
    </ReactFlowProvider>
  )
}
