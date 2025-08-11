// src/app/account/my-posts/[id]/page.tsx
import { createClient } from '@/lib/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

// Define the type for a line item to ensure type safety
type LineItem = {
    id: number;
    description: string;
    price: number;
};

const MyPostDetailsPage = async ({ params }: { params: { id: string } }) => {
    const { id } = params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/');

    const { data: job, error: jobError } = await supabase
        .from('job_posts')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (jobError || !job) notFound();

    const { data: proposals, error: proposalsError } = await supabase
        .from('job_proposals')
        .select('*, provider:profiles(id, full_name, business_name)')
        .eq('post_id', id)
        .order('created_at', { ascending: true });

    async function handleDecision(formData: FormData) {
        'use server';
        const proposalId = formData.get('proposalId') as string;
        const decision = formData.get('decision') as 'approved' | 'rejected';
        const providerId = formData.get('providerId') as string;
        
        const supabase = await createClient();
        
        // 1. Update the status of the specific proposal
        await supabase
            .from('job_proposals')
            .update({ status: decision })
            .eq('id', proposalId);

        // 2. If approved, update the main job post and reject others
        if (decision === 'approved') {
            await supabase
                .from('job_posts')
                .update({ winning_proposal_id: proposalId, status: 'closed' })
                .eq('id', job.id);

            await supabase
                .from('job_proposals')
                .update({ status: 'rejected' })
                .eq('post_id', job.id)
                .neq('id', proposalId)
                .eq('status', 'pending');
        }

        // 3. Send a notification to the provider
        let notificationMessage = `Your quote for "${job.title}" has been ${decision}.`;
        if (decision === 'approved') {
            notificationMessage += ' Please contact the user via Messages to arrange a final assessment.';
        }

        await supabase.from('notifications').insert({
            user_id: providerId,
            message: notificationMessage,
            link: `/jobs/${job.id}`
        });
        
        revalidatePath(`/account/my-posts/${id}`);
    }

    const hasWinningProposal = !!job.winning_proposal_id;

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <BackButton />
            <div className="bg-white p-6 rounded-lg border shadow-sm mt-4">
                <div className="flex justify-between items-start">
                    <h1 className="text-3xl font-bold">{job.title}</h1>
                    <span className={`capitalize px-3 py-1 text-sm font-semibold rounded-full ${
                        job.status === 'open' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'
                    }`}>{job.status}</span>
                </div>
                <p className="text-gray-600 mt-2">{job.description}</p>
            </div>

            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Quotes Received</h2>
                {hasWinningProposal && (
                    <div className="p-4 mb-4 bg-green-50 text-green-800 border border-green-200 rounded-lg">
                        You have accepted a quote for this job. The job post is now closed.
                    </div>
                )}
                <div className="space-y-4">
                    {proposals && proposals.length > 0 ? proposals.map(p => (
                        <div key={p.id} className="bg-white p-4 rounded-lg border shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Link href={`/provider/${p.provider?.id}`} className="font-bold text-lg hover:underline">{p.provider?.business_name || p.provider?.full_name}</Link>
                                    <p className="text-gray-700 mt-2 text-sm">{p.quote_details}</p>
                                </div>
                                <span className={`capitalize px-3 py-1 text-xs font-semibold rounded-full ${
                                    p.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                    p.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                    'bg-yellow-100 text-yellow-800'
                                }`}>{p.status}</span>
                            </div>

                            <div className="mt-4 border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-2 text-left font-semibold text-gray-600">Item Description</th>
                                            <th className="p-2 text-right font-semibold text-gray-600 w-40">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(p.line_items as LineItem[])?.map((item: LineItem) => (
                                            <tr key={item.id} className="border-t">
                                                <td className="p-2">{item.description}</td>
                                                <td className="p-2 text-right">R{item.price.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t bg-gray-100 font-bold">
                                            <td className="p-2 text-right">Total:</td>
                                            <td className="p-2 text-right">R{p.quote_amount.toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {!hasWinningProposal && p.status === 'pending' && (
                                <form action={handleDecision} className="mt-4 flex gap-2 border-t pt-4">
                                    <input type="hidden" name="proposalId" value={p.id} />
                                    <input type="hidden" name="providerId" value={p.provider?.id} />
                                    <Button type="submit" name="decision" value="approved">Approve Quote</Button>
                                    <Button type="submit" name="decision" value="rejected" variant="destructive">Reject Quote</Button>
                                </form>
                            )}
                        </div>
                    )) : (
                        <p>You have not received any quotes for this job yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyPostDetailsPage;