import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Foundation/Colors',
  parameters: {
    docs: {
      description: {
        component: 'BoxCall professional color system featuring jade green and navy blue for authoritative football coaching interfaces.'
      }
    }
  }
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const ColorSwatch = ({ color, name, hex, usage }: { color: string; name: string; hex: string; usage: string }) => (
  <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
    <div className={`w-16 h-16 rounded-md ${color} border border-gray-300`} />
    <div>
      <h3 className="font-semibold text-lg">{name}</h3>
      <p className="text-gray-600 font-mono text-sm">{hex}</p>
      <p className="text-sm text-gray-700 mt-1">{usage}</p>
    </div>
  </div>
)

export const PrimaryColors: Story = {
  render: () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Primary Brand Colors</h2>
      <div className="grid gap-4">
        <ColorSwatch 
          color="bg-jade-500" 
          name="Jade Primary" 
          hex="#00A86B" 
          usage="Primary actions, call-to-action buttons, success states"
        />
        <ColorSwatch 
          color="bg-navy-500" 
          name="Navy Primary" 
          hex="#1E3A8A" 
          usage="Secondary actions, headings, professional authority"
        />
      </div>
    </div>
  )
}

export const JadePalette: Story = {
  render: () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Jade Color Scale</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <ColorSwatch color="bg-jade-50" name="Jade 50" hex="#f0fdf4" usage="Background tints" />
        <ColorSwatch color="bg-jade-100" name="Jade 100" hex="#dcfce7" usage="Light backgrounds" />
        <ColorSwatch color="bg-jade-200" name="Jade 200" hex="#bbf7d0" usage="Subtle highlights" />
        <ColorSwatch color="bg-jade-300" name="Jade 300" hex="#86efac" usage="Muted accents" />
        <ColorSwatch color="bg-jade-400" name="Jade 400" hex="#4ade80" usage="Secondary buttons" />
        <ColorSwatch color="bg-jade-500" name="Jade 500" hex="#00A86B" usage="Primary buttons" />
        <ColorSwatch color="bg-jade-600" name="Jade 600" hex="#059669" usage="Hover states" />
        <ColorSwatch color="bg-jade-700" name="Jade 700" hex="#047857" usage="Active states" />
        <ColorSwatch color="bg-jade-800" name="Jade 800" hex="#065f46" usage="Dark text" />
        <ColorSwatch color="bg-jade-900" name="Jade 900" hex="#064e3b" usage="Darkest text" />
      </div>
    </div>
  )
}

export const NavyPalette: Story = {
  render: () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Navy Color Scale</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <ColorSwatch color="bg-navy-50" name="Navy 50" hex="#eff6ff" usage="Background tints" />
        <ColorSwatch color="bg-blue-100" name="Navy 100" hex="#dbeafe" usage="Light backgrounds" />
        <ColorSwatch color="bg-blue-200" name="Navy 200" hex="#bfdbfe" usage="Subtle highlights" />
        <ColorSwatch color="bg-blue-300" name="Navy 300" hex="#93c5fd" usage="Muted accents" />
        <ColorSwatch color="bg-blue-400" name="Navy 400" hex="#60a5fa" usage="Secondary elements" />
        <ColorSwatch color="bg-navy-500" name="Navy 500" hex="#1E3A8A" usage="Primary navy" />
        <ColorSwatch color="bg-blue-600" name="Navy 600" hex="#1e40af" usage="Hover states" />
        <ColorSwatch color="bg-blue-700" name="Navy 700" hex="#1d4ed8" usage="Active states" />
        <ColorSwatch color="bg-blue-800" name="Navy 800" hex="#1e3a8a" usage="Dark text" />
        <ColorSwatch color="bg-blue-900" name="Navy 900" hex="#1e3a8a" usage="Darkest text" />
      </div>
    </div>
  )
}

export const SemanticColors: Story = {
  render: () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Semantic Color Usage</h2>
      <div className="grid gap-4">
        <ColorSwatch 
          color="bg-jade-500" 
          name="Success / Primary Action" 
          hex="#00A86B" 
          usage="Successful plays, confirmed actions, positive coaching feedback"
        />
        <ColorSwatch 
          color="bg-navy-500" 
          name="Information / Authority" 
          hex="#1E3A8A" 
          usage="Coaching authority, team information, strategic planning"
        />
        <ColorSwatch 
          color="bg-red-500" 
          name="Error / Warning" 
          hex="#ef4444" 
          usage="Penalties, errors, critical alerts during games"
        />
        <ColorSwatch 
          color="bg-amber-500" 
          name="Caution / Attention" 
          hex="#f59e0b" 
          usage="Timeouts, substitutions, attention-needed situations"
        />
        <ColorSwatch 
          color="bg-gray-500" 
          name="Neutral / Disabled" 
          hex="#6b7280" 
          usage="Disabled states, neutral information, inactive elements"
        />
      </div>
    </div>
  )
}

export const CoachingContextColors: Story = {
  render: () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Football Coaching Context</h2>
      
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Sideline Quick Actions</h3>
        <div className="flex space-x-3">
          <button className="bg-jade-500 hover:bg-jade-600 text-white px-4 py-2 rounded-md font-semibold">
            Call Timeout
          </button>
          <button className="bg-navy-500 hover:bg-navy-600 text-white px-4 py-2 rounded-md font-semibold">
            View Formation
          </button>
          <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md font-semibold">
            Substitution
          </button>
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-semibold">
            Challenge Play
          </button>
        </div>
      </div>

      <div className="bg-jade-50 p-6 rounded-lg border border-jade-200">
        <h3 className="text-xl font-semibold text-jade-900 mb-4">Successful Play Execution</h3>
        <div className="text-jade-800">
          <p className="mb-2">✅ Touchdown - 15 yard pass completion</p>
          <p className="mb-2">✅ First Down - Running play successful</p>
          <p>✅ Field Goal - 32 yards successful</p>
        </div>
      </div>

      <div className="bg-navy-50 p-6 rounded-lg border border-navy-200">
        <h3 className="text-xl font-semibold text-navy-900 mb-4">Coaching Authority Interface</h3>
        <div className="text-navy-800">
          <p className="mb-2">📋 Game Plan Review</p>
          <p className="mb-2">📊 Player Performance Analytics</p>
          <p>🎯 Strategic Formation Planning</p>
        </div>
      </div>
    </div>
  )
}
