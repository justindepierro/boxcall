import type { Preview } from '@storybook/react'
import "../src/styles/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff'
        },
        {
          name: 'jade-50',
          value: '#f0fdf4'
        },
        {
          name: 'navy-50',
          value: '#eff6ff'
        },
        {
          name: 'dark',
          value: '#1e293b'
        }
      ]
    },
    viewport: {
      viewports: {
        // Mobile viewports for coaching interfaces
        iphone12: {
          name: 'iPhone 12/13/14',
          styles: {
            width: '390px',
            height: '844px'
          }
        },
        iphone12mini: {
          name: 'iPhone 12/13 Mini',
          styles: {
            width: '375px',
            height: '812px'
          }
        },
        iphone14plus: {
          name: 'iPhone 14/15 Plus',
          styles: {
            width: '428px',
            height: '926px'
          }
        },
        android: {
          name: 'Android (Typical)',
          styles: {
            width: '360px',
            height: '640px'
          }
        },
        tablet: {
          name: 'iPad',
          styles: {
            width: '768px',
            height: '1024px'
          }
        },
        // Desktop viewports
        laptop: {
          name: 'Laptop',
          styles: {
            width: '1366px',
            height: '768px'
          }
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1920px',
            height: '1080px'
          }
        }
      }
    },
    docs: {
      source: {
        state: 'open'
      }
    }
  },
  globalTypes: {
    theme: {
      description: 'BoxCall Theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' }
        ],
        dynamicTitle: true
      }
    },
    userRole: {
      description: 'User Role for Football Context',
      defaultValue: 'coach',
      toolbar: {
        title: 'Role',
        icon: 'user',
        items: [
          { value: 'coach', title: 'Coach', icon: 'user' },
          { value: 'player', title: 'Player', icon: 'accessibility' },
          { value: 'parent', title: 'Parent/Family', icon: 'useralt' }
        ],
        dynamicTitle: true
      }
    }
  }
}

export default preview
