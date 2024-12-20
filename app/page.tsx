'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import MedicationModal from '@/components/MedicationModal';

interface Medication {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export default function Home() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);

  const handleAddEdit = (medication: Medication) => {
    if (editingMedication) {
      setMedications(medications.map(med => 
        med.id === medication.id ? medication : med
      ));
    } else {
      setMedications([...medications, { ...medication, id: Date.now().toString() }]);
    }
    setIsModalOpen(false);
    setEditingMedication(null);
  };

  const handleDelete = (id: string) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const openEditModal = (medication: Medication) => {
    setEditingMedication(medication);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Medication Management</h1>
      
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

        {/* Medication Cards */}
        {medications.map((medication) => (
          <Card key={medication.id} className="h-[400px] flex flex-col">
            <CardHeader className="relative h-48">
              <div className="absolute inset-0 bg-muted rounded-t-lg">
                {medication.imageUrl && (
                  <img
                    src={medication.imageUrl}
                    alt={medication.name}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <h2 className="text-xl font-semibold mb-2">{medication.name}</h2>
              <p className="text-muted-foreground line-clamp-3">{medication.description}</p>
              <p className="text-lg font-bold mt-2">${medication.price.toFixed(2)}</p>
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