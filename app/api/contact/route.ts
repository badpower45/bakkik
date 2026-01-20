import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { optionalAuth } from '@/lib/middleware/auth';

/**
 * POST /api/contact
 * Submit a contact form message
 */
export async function POST(request: NextRequest) {
    try {
        const user = await optionalAuth(request);
        const body = await request.json();

        const { name, email, subject, message } = body;

        // Validation
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        // Message length validation
        if (message.length < 10) {
            return NextResponse.json(
                { error: 'Message must be at least 10 characters' },
                { status: 400 }
            );
        }

        // Insert into database
        const { data, error } = await supabase
            .from('contact_submissions')
            .insert({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                subject: subject.trim(),
                message: message.trim(),
                user_id: user?.id || null,
            })
            .select()
            .single();

        if (error) {
            console.error('Contact submission error:', error);
            return NextResponse.json(
                { error: 'Failed to submit contact form' },
                { status: 500 }
            );
        }

        // TODO: Send email notification to admin
        // You can integrate with SendGrid, Mailgun, or AWS SES here

        return NextResponse.json({
            success: true,
            message: 'Your message has been received. We will get back to you soon!',
            submissionId: data.id,
        });
    } catch (error: any) {
        console.error('Contact API error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/contact
 * Get contact submissions (Admin only)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'all';
        const limit = parseInt(searchParams.get('limit') || '50');

        let query = supabase
            .from('contact_submissions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (status !== 'all') {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            submissions: data,
            count: data.length,
        });
    } catch (error: any) {
        console.error('Get contacts error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch submissions' },
            { status: 500 }
        );
    }
}
