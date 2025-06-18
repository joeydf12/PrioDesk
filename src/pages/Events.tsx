import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Calendar, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    type: 'meeting' | 'deadline' | 'presentation';
}

const Events = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('user_id', user?.id)
                .order('date', { ascending: true });

            if (error) throw error;
            setEvents(data || []);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const handleCreateEvent = async (title: string, description: string, date: string, time: string, type: string) => {
        try {
            const { data, error } = await supabase
                .from('events')
                .insert([
                    {
                        title,
                        description,
                        date,
                        time,
                        type,
                        user_id: user?.id,
                    },
                ])
                .select();

            if (error) throw error;
            await fetchEvents();
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header onCreateTask={() => { }} />

            <main className="container mx-auto px-4 py-8 pb-24">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6">
                        <Button
                            variant="ghost"
                            className="mb-4"
                            onClick={() => navigate('/profile')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Terug naar profiel
                        </Button>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Events</h1>
                        <p className="text-slate-600">Bekijk en beheer je agenda</p>
                    </div>

                    <Card>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {events.map(event => (
                                    <Card key={event.id} className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-lg">{event.title}</h3>
                                                <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                                            </div>
                                            <Badge variant={
                                                event.type === 'meeting' ? 'default' :
                                                    event.type === 'deadline' ? 'destructive' :
                                                        'secondary'
                                            }>
                                                {event.type === 'meeting' ? 'Meeting' :
                                                    event.type === 'deadline' ? 'Deadline' :
                                                        'Presentatie'}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(event.date).toLocaleDateString('nl-NL')}</span>
                                            <span>•</span>
                                            <span>{event.time}</span>
                                        </div>
                                    </Card>
                                ))}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="w-full" variant="outline">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Nieuw Event
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Nieuw Event</DialogTitle>
                                            <DialogDescription>
                                                Voeg een nieuw event toe aan je agenda.
                                            </DialogDescription>
                                            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                                                <X className="h-4 w-4" />
                                                <span className="sr-only">Close</span>
                                            </DialogClose>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="eventTitle">Event titel</Label>
                                                <Input id="eventTitle" placeholder="Voer event titel in" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="eventDate">Datum</Label>
                                                <Input id="eventDate" type="date" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="eventTime">Tijd</Label>
                                                <Input id="eventTime" type="time" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="eventDescription">Beschrijving</Label>
                                                <Input id="eventDescription" placeholder="Voer event beschrijving in" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="eventType">Type</Label>
                                                <select
                                                    id="eventType"
                                                    className="w-full p-2 border rounded-md bg-slate-50"
                                                >
                                                    <option value="meeting">Meeting</option>
                                                    <option value="deadline">Deadline</option>
                                                    <option value="presentation">Presentatie</option>
                                                </select>
                                            </div>
                                            <Button
                                                className="w-full"
                                                onClick={async () => {
                                                    const titleInput = document.getElementById('eventTitle') as HTMLInputElement;
                                                    const dateInput = document.getElementById('eventDate') as HTMLInputElement;
                                                    const timeInput = document.getElementById('eventTime') as HTMLInputElement;
                                                    const descInput = document.getElementById('eventDescription') as HTMLInputElement;
                                                    const typeInput = document.getElementById('eventType') as HTMLSelectElement;
                                                    if (titleInput && dateInput && timeInput && descInput && typeInput) {
                                                        try {
                                                            await handleCreateEvent(
                                                                titleInput.value,
                                                                descInput.value,
                                                                dateInput.value,
                                                                timeInput.value,
                                                                typeInput.value
                                                            );
                                                            // Close dialog and refresh
                                                            const closeButton = document.querySelector('[data-state="open"] button[aria-label="Close"]') as HTMLButtonElement;
                                                            if (closeButton) closeButton.click();
                                                        } catch (error) {
                                                            console.error('Error creating event:', error);
                                                        }
                                                    }
                                                }}
                                            >
                                                Event aanmaken
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <MobileNav />
        </div>
    );
};

export default Events; 