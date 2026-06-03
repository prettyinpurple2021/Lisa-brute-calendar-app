import { streamText, convertToModelMessages } from 'ai'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { eventId, eventTitle, eventDescription, additionalContext } = await req.json()

    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Generate meeting prep using AI
    const result = streamText({
      model: 'anthropic/claude-sonnet-4-20250514',
      system: `You are a helpful AI assistant for solo founders building startups. Your job is to help prepare for meetings by generating:
1. Key talking points
2. Questions to ask
3. Goals for the meeting
4. Potential concerns or risks to address
5. Quick facts or context that might be relevant

Be concise, actionable, and focused on helping the user have a productive meeting. Format your response with clear sections using markdown headers.`,
      messages: await convertToModelMessages([
        {
          role: 'user',
          content: `Help me prepare for this meeting:

**Meeting Title:** ${eventTitle}

**Description:** ${eventDescription || 'No description provided'}

${additionalContext ? `**Additional Context:** ${additionalContext}` : ''}

Please generate a meeting prep document with talking points, questions to ask, goals, and any other relevant preparation notes.`,
        },
      ]),
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Meeting prep error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
