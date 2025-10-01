import type { Meta, StoryObj } from '@storybook/react';
import { PlayCard as PlayCardV2 } from './PlayCard.v2';
import { PlayCard as PlayCardOld } from './PlayCard';
import type { Play } from '../../types/play';

const meta: Meta<typeof PlayCardV2> = {
  title: 'Features/Playbook/PlayCard V2 Redesign',
  component: PlayCardV2,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PlayCardV2>;

const samplePlay: Play = {
  id: '1',
  playbook_id: 'pb1',
  formation: 'Trips Right',
  f_type: 'Trips',
  f_dir: 'Right',
  play_name: 'Iz Run',
  one_word_play: 'IZ',
  p_type: 'Run',
  p_dir: 'Right',
  personnel: '11',
  protection: 'Max',
  confidence_base: 70,
  p_tag1: 'Gap',
  p_tag2: 'Inside',
  ftag1: 'Spread',
  created_at: new Date(),
  updated_at: new Date(),
  created_by: 'user1',
  back_align: '',
  shift: '',
  motion: '',
  ftag2: '',
  r_str: '',
  p_str: '',
  key_player1: '',
  key_player2: '',
  check_into: '',
  pref_down: '',
  pref_dis: '',
  pref_hash: '',
  pref_cov: '',
  pref_front: '',
  install_phase: 'install',
  times_called: 0,
  times_successful: 0,
  complexity_score: 0,
  is_archived: false,
  duplicate_key: '',
  diagram_url: '',
};

const passPlay: Play = {
  ...samplePlay,
  id: '2',
  formation: 'Empty',
  f_type: 'Empty',
  play_name: 'Fade',
  one_word_play: 'FADE',
  p_type: 'Pass',
  p_dir: 'Right',
  confidence_base: 85,
  protection: 'Slide',
};

const rpoPlay: Play = {
  ...samplePlay,
  id: '3',
  formation: 'Pistol',
  f_type: 'Pistol',
  play_name: 'Slant RPO',
  one_word_play: 'SLANT',
  p_type: 'RPO',
  confidence_base: 92,
};

const playActionPlay: Play = {
  ...samplePlay,
  id: '4',
  formation: 'I-Form',
  f_type: 'I-Form',
  play_name: 'Boot',
  one_word_play: 'BOOT',
  p_type: 'Play Action',
  confidence_base: 55,
};

// Story: New Design
export const NewDesign: Story = {
  args: {
    play: samplePlay,
    showOneWordCalls: false,
    onEdit: (play) => console.log('Edit:', play),
    onDuplicate: (play) => console.log('Duplicate:', play),
    onCreateDiagram: (play) => console.log('Create Diagram:', play),
  },
};

// Story: Side by Side Comparison
export const Comparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-slate-900">
          🚀 New Aurora Design (v2)
        </h2>
        <p className="text-slate-600 mb-4">
          Glass morphism, gradient accents, circular confidence ring, icon capsules, blazing fast!
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PlayCardV2
            play={samplePlay}
            onEdit={(play) => console.log('Edit:', play)}
            onDuplicate={(play) => console.log('Duplicate:', play)}
            onCreateDiagram={(play) => console.log('Create Diagram:', play)}
          />
          <PlayCardV2
            play={passPlay}
            onEdit={(play) => console.log('Edit:', play)}
            onDuplicate={(play) => console.log('Duplicate:', play)}
            onCreateDiagram={(play) => console.log('Create Diagram:', play)}
          />
        </div>
      </div>

      <div className="border-t-4 border-slate-200 pt-8">
        <h2 className="text-2xl font-bold mb-4 text-slate-900">
          📦 Old Design (Current)
        </h2>
        <p className="text-slate-600 mb-4">
          Functional but heavier, more complex inline editing
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PlayCardOld
            play={samplePlay}
            density="compact"
            onEdit={(play) => console.log('Edit:', play)}
            onDuplicate={(play) => console.log('Duplicate:', play)}
            onCreateDiagram={(play) => console.log('Create Diagram:', play)}
          />
          <PlayCardOld
            play={passPlay}
            density="compact"
            onEdit={(play) => console.log('Edit:', play)}
            onDuplicate={(play) => console.log('Duplicate:', play)}
            onCreateDiagram={(play) => console.log('Create Diagram:', play)}
          />
        </div>
      </div>
    </div>
  ),
};

// Story: All Play Types
export const AllPlayTypes: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <h3 className="text-sm font-bold mb-2 text-slate-700">Run Play</h3>
        <PlayCardV2
          play={samplePlay}
          onEdit={(play) => console.log('Edit:', play)}
          onDuplicate={(play) => console.log('Duplicate:', play)}
          onCreateDiagram={(play) => console.log('Create Diagram:', play)}
        />
      </div>
      <div>
        <h3 className="text-sm font-bold mb-2 text-slate-700">Pass Play</h3>
        <PlayCardV2
          play={passPlay}
          onEdit={(play) => console.log('Edit:', play)}
          onDuplicate={(play) => console.log('Duplicate:', play)}
          onCreateDiagram={(play) => console.log('Create Diagram:', play)}
        />
      </div>
      <div>
        <h3 className="text-sm font-bold mb-2 text-slate-700">RPO</h3>
        <PlayCardV2
          play={rpoPlay}
          onEdit={(play) => console.log('Edit:', play)}
          onDuplicate={(play) => console.log('Duplicate:', play)}
          onCreateDiagram={(play) => console.log('Create Diagram:', play)}
        />
      </div>
      <div>
        <h3 className="text-sm font-bold mb-2 text-slate-700">Play Action</h3>
        <PlayCardV2
          play={playActionPlay}
          onEdit={(play) => console.log('Edit:', play)}
          onDuplicate={(play) => console.log('Duplicate:', play)}
          onCreateDiagram={(play) => console.log('Create Diagram:', play)}
        />
      </div>
    </div>
  ),
};

// Story: Selected State
export const Selected: Story = {
  args: {
    play: samplePlay,
    isSelected: true,
    onEdit: (play) => console.log('Edit:', play),
    onDuplicate: (play) => console.log('Duplicate:', play),
    onCreateDiagram: (play) => console.log('Create Diagram:', play),
  },
};

// Story: With One Word Calls
export const OneWordCalls: Story = {
  args: {
    play: samplePlay,
    showOneWordCalls: true,
    onEdit: (play) => console.log('Edit:', play),
    onDuplicate: (play) => console.log('Duplicate:', play),
    onCreateDiagram: (play) => console.log('Create Diagram:', play),
  },
};

// Story: Expanded State
export const ExpandedDetails: Story = {
  render: () => {
    const ExpandedCard = () => {
      return (
        <PlayCardV2
          play={{
            ...samplePlay,
            diagram_url: 'https://placehold.co/600x400/1e40af/ffffff?text=Trips+Right+Iz+Run',
          }}
          onEdit={(play) => console.log('Edit:', play)}
          onDuplicate={(play) => console.log('Duplicate:', play)}
          onCreateDiagram={(play) => console.log('Create Diagram:', play)}
        />
      );
    };
    return <ExpandedCard />;
  },
};
