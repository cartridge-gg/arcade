import { ImageResponse } from '@vercel/og';
import type { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

/**
 * OG Image Generation API
 *
 * Generates dynamic Open Graph images for:
 * - Player profiles
 * - Game pages
 * - Game-specific player profiles
 */

export default async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const type = searchParams.get('type');
    const username = searchParams.get('username');
    const game = searchParams.get('game');
    const points = searchParams.get('points');
    const achievements = searchParams.get('achievements');

    // Validate required parameters based on type
    if (!type) {
      return new Response('Missing type parameter', { status: 400 });
    }

    // Generate image based on type
    if (type === 'profile') {
      return generateProfileImage(username || '', points || '0', achievements || '0/0');
    } else if (type === 'game') {
      return generateGameImage(game || '');
    } else if (type === 'game-profile') {
      return generateGameProfileImage(
        username || '',
        game || '',
        points || '0',
        achievements || '0/0'
      );
    }

    return new Response('Invalid type parameter', { status: 400 });
  } catch (error) {
    console.error('OG image generation error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}

/**
 * Generate OG image for player profile
 */
function generateProfileImage(username: string, points: string, achievements: string) {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#161A17',
          backgroundImage: 'linear-gradient(135deg, #161A17 0%, #1F241E 50%, #2A2D2A 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '60px',
        }}
      >
        {/* Cartridge Branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '48px',
          }}
        >
          <div
            style={{
              color: '#FBCB4A',
              fontSize: '40px',
              fontWeight: 'bold',
              letterSpacing: '-0.02em',
            }}
          >
            CARTRIDGE ARCADE
          </div>
        </div>

        {/* Main Content Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '60px 80px',
            borderRadius: '24px',
            backgroundColor: 'rgba(251, 203, 74, 0.05)',
            border: '2px solid rgba(251, 203, 74, 0.2)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Username */}
          <div
            style={{
              color: '#FBCB4A',
              fontSize: '56px',
              fontWeight: 'bold',
              marginBottom: '32px',
              letterSpacing: '-0.02em',
            }}
          >
            {username}
          </div>

          {/* Stats Container */}
          <div
            style={{
              display: 'flex',
              gap: '80px',
              marginTop: '24px',
            }}
          >
            {/* Points */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  color: '#FBCB4A',
                  fontSize: '52px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                }}
              >
                {Number(points).toLocaleString()}
              </div>
              <div
                style={{
                  color: '#9CA3AF',
                  fontSize: '24px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Points
              </div>
            </div>

            {/* Achievements */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  color: '#FBCB4A',
                  fontSize: '52px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                }}
              >
                {achievements}
              </div>
              <div
                style={{
                  color: '#9CA3AF',
                  fontSize: '24px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Achievements
              </div>
            </div>
          </div>
        </div>

        {/* Footer Tagline */}
        <div
          style={{
            marginTop: '48px',
            color: '#6B7280',
            fontSize: '20px',
            letterSpacing: '0.05em',
          }}
        >
          Discover, Play and Compete in Onchain Games
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

/**
 * Generate OG image for game page
 */
function generateGameImage(game: string) {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#161A17',
          backgroundImage: 'linear-gradient(135deg, #161A17 0%, #1F241E 50%, #2A2D2A 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '60px',
        }}
      >
        {/* Cartridge Branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '48px',
          }}
        >
          <div
            style={{
              color: '#FBCB4A',
              fontSize: '40px',
              fontWeight: 'bold',
              letterSpacing: '-0.02em',
            }}
          >
            CARTRIDGE ARCADE
          </div>
        </div>

        {/* Game Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '80px 100px',
            borderRadius: '24px',
            backgroundColor: 'rgba(251, 203, 74, 0.05)',
            border: '2px solid rgba(251, 203, 74, 0.2)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            style={{
              color: '#FBCB4A',
              fontSize: '72px',
              fontWeight: 'bold',
              textAlign: 'center',
              letterSpacing: '-0.02em',
              textTransform: 'capitalize',
            }}
          >
            {game.replace(/-/g, ' ')}
          </div>
          <div
            style={{
              color: '#9CA3AF',
              fontSize: '28px',
              marginTop: '24px',
              letterSpacing: '0.05em',
            }}
          >
            Play on Cartridge Arcade
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: '48px',
            color: '#6B7280',
            fontSize: '20px',
            letterSpacing: '0.05em',
          }}
        >
          Discover, Play and Compete in Onchain Games
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

/**
 * Generate OG image for game-specific player profile
 */
function generateGameProfileImage(
  username: string,
  game: string,
  points: string,
  achievements: string
) {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#161A17',
          backgroundImage: 'linear-gradient(135deg, #161A17 0%, #1F241E 50%, #2A2D2A 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '60px',
        }}
      >
        {/* Cartridge Branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              color: '#FBCB4A',
              fontSize: '32px',
              fontWeight: 'bold',
              letterSpacing: '-0.02em',
            }}
          >
            CARTRIDGE ARCADE
          </div>
        </div>

        {/* Main Content Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '60px 80px',
            borderRadius: '24px',
            backgroundColor: 'rgba(251, 203, 74, 0.05)',
            border: '2px solid rgba(251, 203, 74, 0.2)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Game Name */}
          <div
            style={{
              color: '#9CA3AF',
              fontSize: '28px',
              marginBottom: '16px',
              textTransform: 'capitalize',
              letterSpacing: '0.05em',
            }}
          >
            {game.replace(/-/g, ' ')}
          </div>

          {/* Username */}
          <div
            style={{
              color: '#FBCB4A',
              fontSize: '56px',
              fontWeight: 'bold',
              marginBottom: '32px',
              letterSpacing: '-0.02em',
            }}
          >
            {username}
          </div>

          {/* Stats Container */}
          <div
            style={{
              display: 'flex',
              gap: '80px',
              marginTop: '16px',
            }}
          >
            {/* Points */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  color: '#FBCB4A',
                  fontSize: '48px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                }}
              >
                {Number(points).toLocaleString()}
              </div>
              <div
                style={{
                  color: '#9CA3AF',
                  fontSize: '22px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Points
              </div>
            </div>

            {/* Achievements */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  color: '#FBCB4A',
                  fontSize: '48px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                }}
              >
                {achievements}
              </div>
              <div
                style={{
                  color: '#9CA3AF',
                  fontSize: '22px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Achievements
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: '40px',
            color: '#6B7280',
            fontSize: '18px',
            letterSpacing: '0.05em',
          }}
        >
          Player stats in {game.replace(/-/g, ' ')}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
