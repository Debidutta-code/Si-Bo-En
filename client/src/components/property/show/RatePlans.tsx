import  { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Loader from '../../Loader/Loader';
import { type IRatePlans } from "../types/types";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'; // Assuming these components are available
import { Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {fetchRatePlansService,removeRatePlanService} from "@/pages/rate-plan/services"
import {useParams} from "react-router-dom";

export default function RatePlans() {
    const { propertyId } = useParams<{ propertyId: string }>();
  
  const [loading, setLoading] = useState(true);
  const [ratePlans, setRatePlans] = useState<IRatePlans[]>([]);
  const [ratePlanToDelete, setRatePlanToDelete] = useState<string | null>(null);

  const fetchRatePlans = async (propertyId: string) => {
    setLoading(true);
    try {
      const response = await fetchRatePlansService(propertyId);
      if (response.success) {
        const data = response.data;
        setRatePlans(data);
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch property details");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRatePlan = async () => {
    if (!ratePlanToDelete) return;

    try {
      const response = await removeRatePlanService(ratePlanToDelete);
      if (response.success) {
        toast.success("Rate plan deleted successfully");
        setRatePlans(ratePlans.filter(plan => plan.ratePlanCode !== ratePlanToDelete));
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete rate plan");
    } finally {
      setRatePlanToDelete(null); // Reset the state after action
    }
  };

  useEffect(() => {
    if (!propertyId) {
      toast.error("Property id not found");
      return;
    }
    fetchRatePlans(propertyId);
  }, [propertyId]);

  if (loading) {
    return (
        <Loader text="Loading Rate Plans" />
        );
  }

  return (
    <div className="bg-white text-black font-sans p-4 border-black mx-auto">
      {ratePlans.length > 0 ? (
        <Card className="shadow-none border-none md:rounded-lg">
          <CardHeader>
            <CardTitle className="text-xl">Available Rate Plans</CardTitle>

          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {ratePlans.map((ratePlan) => (
                <div key={ratePlan.ratePlanCode} className="px-2 py-1 border border-gray-300 rounded-lg flex justify-between items-center">
                  <span className="font-medium text-sm">{ratePlan.ratePlanName}</span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => setRatePlanToDelete(ratePlan.ratePlanCode)}
                      >
                        <Trash className="h-5 w-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the rate plan "{ratePlan.ratePlanName}" and its associated price in allotment.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteRatePlan}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12">
          <h4 className="text-xl font-bold mb-2">No Rate Plans Found</h4>
          <p className="text-gray-500 mb-4">There are no rate plans configured for this property.</p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Rate Plan
          </Button>
        </div>
      )}
    </div>
  );
}