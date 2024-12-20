'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import MedicationModal from '@/components/MedicationModal';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface Medication {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

const API_BASE_URL = 'http://localhost:8080';

// Timeout for API calls (90 seconds)
const FETCH_TIMEOUT = 90000;

// Helper function to fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        // Add any Authorization header if needed
        ...options.headers,
      },
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
};

export default function Home() {
  console.log('Component rendering'); // Debug log

  const [medications, setMedications] = useState<Medication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('useEffect triggered'); // Debug log
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    console.log('fetchMedications called'); // Debug log
    try {
      if (isInitialLoad) {
        toast({
          title: "Loading",
          description: "The server may take up to a minute to respond on first load...",
        });
      }

      console.log('Making API call...'); // Debug log
      const response = await fetchWithTimeout(`${API_BASE_URL}/medications`);
      console.log('API response received'); // Debug log
      
      if (!response.ok) throw new Error('Failed to fetch medications');
      const data = await response.json();
      console.log('Medications data:', data); // Debug log
      
      setMedications(data);
      
      if (isInitialLoad) {
        toast({
          title: "Success",
          description: "Medications loaded successfully!",
        });
        setIsInitialLoad(false);
      }
    } catch (error) {
      console.error('Error in fetchMedications:', error); // Debug log
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      toast({
        title: "Error",
        description: isTimeout 
          ? "Request timed out. The server might be starting up, please try again." 
          : "Failed to load medications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEdit = async (medication: Medication) => {
    try {
      if (editingMedication) {
        const response = await fetchWithTimeout(`${API_BASE_URL}/medications/${medication.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(medication),
        });
        
        if (!response.ok) throw new Error('Failed to update medication');
        
        setMedications(medications.map(med => 
          med.id === medication.id ? medication : med
        ));
        
        toast({
          title: "Success",
          description: "Medication updated successfully",
        });
      } else {
        const response = await fetchWithTimeout(`${API_BASE_URL}/medications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(medication),
        });
        
        if (!response.ok) throw new Error('Failed to create medication');
        
        const newMedication = await response.json();
        setMedications([...medications, newMedication]);
        
        toast({
          title: "Success",
          description: "Medication added successfully",
        });
      }
    } catch (error) {
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      toast({
        title: "Error",
        description: isTimeout 
          ? "Request timed out. Please try again." 
          : editingMedication 
            ? "Failed to update medication" 
            : "Failed to add medication",
        variant: "destructive",
      });
    } finally {
      setIsModalOpen(false);
      setEditingMedication(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/medications/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete medication');
      
      setMedications(medications.filter(med => med.id !== id));
      
      toast({
        title: "Success",
        description: "Medication deleted successfully",
      });
    } catch (error) {
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      toast({
        title: "Error",
        description: isTimeout 
          ? "Request timed out. Please try again." 
          : "Failed to delete medication",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (medication: Medication) => {
    setEditingMedication(medication);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Simplytest</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Add New Medication Card */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-dashed h-[400px] flex items-center justify-center"
          onClick={() => {
            setEditingMedication(null);
            setIsModalOpen(true);
          }}
        >
          <CardContent className="flex flex-col items-center justify-center text-muted-foreground">
            <Plus size={48} className="mb-4" />
            <p className="text-lg font-medium">Add New Medication</p>
          </CardContent>
        </Card>

        {/* Loading Skeletons */}
        {isLoading && Array.from({ length: 3 }).map((_, index) => (
          <Card key={`skeleton-${index}`} className="h-[400px] flex flex-col">
            <CardHeader className="relative h-48">
              <Skeleton className="absolute inset-0 rounded-t-lg" />
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
            </CardFooter>
          </Card>
        ))}

        {/* Medication Cards */}
        {!isLoading && medications.map((medication) => (
          <Card key={medication.id} className="h-[400px] flex flex-col">
            <CardHeader className="relative h-48">
              <div className="absolute inset-0 bg-muted rounded-t-lg">
                
                  <img
                    src={medication.imageUrl || "https://img.freepik.com/vettori-premium/pillole-e-compresse-di-farmaci-su-sfondo-blu-farmaco-concetto-farmaceutico-illustrazione-di-stile-piatto_285336-1104.jpg"}
                    alt={medication.name}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <h2 className="text-xl font-semibold mb-2">{medication.name}</h2>
              <p className="text-muted-foreground line-clamp-3 mb-2">{medication.description}</p>
              {medication.price !== 0 && (
                <p className="text-lg ">€ {medication.price.toFixed(2)}</p>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => openEditModal(medication)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDelete(medication.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <MedicationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleAddEdit}
        medication={editingMedication}
      />
    </div>
  );
}