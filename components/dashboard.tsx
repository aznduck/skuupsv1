"use client";

import { useState } from "react";
import {
  Plus,
  Edit2,
  ShoppingCart,
  ExternalLink,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

// Import the InventoryChart component
import InventoryChart from "./inventory-chart";

// Types
interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  maxQuantity: number;
  alertThreshold?: number;
  supplier?: string;
  orderUrl?: string;
}

interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
}

interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  imageUrl?: string;
}

interface ProductionEntry {
  recipeId: string;
  tubs: number;
  date: string;
}

interface OrderItem {
  ingredientId: string;
  quantity: number;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    {
      id: "1",
      name: "Whole Milk",
      quantity: 76,
      unit: "Gallons",
      maxQuantity: 100,
      alertThreshold: 20,
      supplier: "Dairy Farms Inc.",
      orderUrl: "https://example.com/dairy",
    },
    {
      id: "2",
      name: "Vanilla Extract",
      quantity: 0,
      unit: "Cups",
      maxQuantity: 5,
      alertThreshold: 30,
      supplier: "Flavor Essentials",
      orderUrl: "https://example.com/flavors",
    },
    {
      id: "3",
      name: "Processed Sugar",
      quantity: 20,
      unit: "Cups",
      maxQuantity: 50,
      alertThreshold: 25,
      supplier: "Sweet Supplies Co.",
      orderUrl: "https://example.com/sugar",
    },
    {
      id: "4",
      name: "Chocolate Chips",
      quantity: 15,
      unit: "Pounds",
      maxQuantity: 30,
      alertThreshold: 15,
      supplier: "Cocoa Traders",
      orderUrl: "https://example.com/chocolate",
    },
    {
      id: "5",
      name: "Strawberry Puree",
      quantity: 8,
      unit: "Quarts",
      maxQuantity: 20,
      alertThreshold: 20,
      supplier: "Fresh Fruit Distributors",
      orderUrl: "https://example.com/fruit",
    },
  ]);

  const [recipes, setRecipes] = useState<Recipe[]>([
    {
      id: "1",
      name: "Vanilla Ice Cream",
      ingredients: [
        { ingredientId: "1", quantity: 1 }, // 1 cup milk
        { ingredientId: "2", quantity: 1 }, // 1 tbsp vanilla
        { ingredientId: "3", quantity: 2 }, // 2 cups sugar
      ],
    },
    {
      id: "2",
      name: "Chocolate Chip",
      ingredients: [
        { ingredientId: "1", quantity: 1 }, // 1 cup milk
        { ingredientId: "3", quantity: 1.5 }, // 1.5 cups sugar
        { ingredientId: "4", quantity: 2 }, // 2 pounds chocolate chips
      ],
    },
    {
      id: "3",
      name: "Strawberry",
      ingredients: [
        { ingredientId: "1", quantity: 1 }, // 1 cup milk
        { ingredientId: "3", quantity: 1.5 }, // 1.5 cups sugar
        { ingredientId: "5", quantity: 2 }, // 2 quarts strawberry puree
      ],
    },
  ]);

  const [newRecipe, setNewRecipe] = useState<Omit<Recipe, "id">>({
    name: "",
    ingredients: [],
  });

  // Update the newIngredient state to include alertThreshold
  const [newIngredient, setNewIngredient] = useState<Omit<Ingredient, "id">>({
    name: "",
    quantity: 0,
    unit: "",
    maxQuantity: 0,
    alertThreshold: 20,
    supplier: "",
    orderUrl: "",
  });

  const [tempIngredient, setTempIngredient] = useState({
    ingredientId: "",
    quantity: 1,
  });

  const [productionData, setProductionData] = useState<{
    recipeId: string;
    tubs: number;
  }>({
    recipeId: "",
    tubs: 0,
  });

  const [showProductionDialog, setShowProductionDialog] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [showAddIngredientInRecipe, setShowAddIngredientInRecipe] =
    useState(false);

  // Function to update an ingredient's alert threshold
  const updateIngredientThreshold = (id: string, threshold: number) => {
    setIngredients(
      ingredients.map((ingredient) =>
        ingredient.id === id
          ? { ...ingredient, alertThreshold: threshold }
          : ingredient
      )
    );

    toast({
      title: "Alert Threshold Updated",
      description: `${getIngredientName(
        id
      )} alert threshold set to ${threshold}%`,
    });
  };

  // Add a new recipe
  const handleAddRecipe = () => {
    if (newRecipe.name.trim() === "" || newRecipe.ingredients.length === 0) {
      toast({
        title: "Error",
        description: "Recipe name and at least one ingredient are required",
        variant: "destructive",
      });
      return;
    }

    const recipe: Recipe = {
      ...newRecipe,
      id: Date.now().toString(),
    };

    setRecipes([...recipes, recipe]);
    setNewRecipe({
      name: "",
      ingredients: [],
    });

    toast({
      title: "Recipe Added",
      description: `${recipe.name} has been added to your recipes`,
    });
  };

  // Add ingredient to recipe during creation
  const handleAddIngredientToRecipe = () => {
    if (tempIngredient.ingredientId === "" || tempIngredient.quantity <= 0) {
      toast({
        title: "Error",
        description: "Please select an ingredient and specify a quantity",
        variant: "destructive",
      });
      return;
    }

    setNewRecipe({
      ...newRecipe,
      ingredients: [...newRecipe.ingredients, { ...tempIngredient }],
    });

    setTempIngredient({
      ingredientId: "",
      quantity: 1,
    });
  };

  // Update the handleAddIngredient function to include alertThreshold
  const handleAddIngredient = () => {
    if (
      newIngredient.name.trim() === "" ||
      newIngredient.quantity < 0 ||
      newIngredient.unit.trim() === "" ||
      newIngredient.maxQuantity <= 0
    ) {
      toast({
        title: "Error",
        description: "All ingredient fields are required",
        variant: "destructive",
      });
      return;
    }

    const ingredient: Ingredient = {
      ...newIngredient,
      id: Date.now().toString(),
    };

    setIngredients([...ingredients, ingredient]);
    setNewIngredient({
      name: "",
      quantity: 0,
      unit: "",
      maxQuantity: 0,
      alertThreshold: 20,
      supplier: "",
      orderUrl: "",
    });

    toast({
      title: "Ingredient Added",
      description: `${ingredient.name} has been added to your inventory`,
    });
  };

  const handleAddIngredientDuringRecipeCreation = () => {
    if (
      newIngredient.name.trim() === "" ||
      newIngredient.quantity < 0 ||
      newIngredient.unit.trim() === "" ||
      newIngredient.maxQuantity <= 0
    ) {
      toast({
        title: "Error",
        description: "All ingredient fields are required",
        variant: "destructive",
      });
      return;
    }

    const ingredient: Ingredient = {
      ...newIngredient,
      id: Date.now().toString(),
    };

    // Add the ingredient to the ingredients list
    setIngredients([...ingredients, ingredient]);

    // Automatically select the new ingredient for the recipe
    setTempIngredient({
      ingredientId: ingredient.id,
      quantity: 1,
    });

    // Reset the new ingredient form
    setNewIngredient({
      name: "",
      quantity: 0,
      unit: "",
      maxQuantity: 0,
      alertThreshold: 20,
      supplier: "",
      orderUrl: "",
    });

    // Close the add ingredient form
    setShowAddIngredientInRecipe(false);

    toast({
      title: "Ingredient Added",
      description: `${ingredient.name} has been added to your inventory and selected for the recipe`,
    });
  };

  // Update the checkForLowStock function to use individual alert thresholds
  const checkForLowStock = (ingredient: Ingredient): boolean => {
    const percentRemaining =
      (ingredient.quantity / ingredient.maxQuantity) * 100;
    const threshold = ingredient.alertThreshold || 20; // Default to 20% if not set
    return percentRemaining < threshold;
  };

  // Get low stock ingredients
  const getLowStockIngredients = () => {
    return ingredients.filter((ingredient) => checkForLowStock(ingredient));
  };

  // Handle adding item to order
  const handleAddToOrder = (ingredientId: string, quantity: number) => {
    const existingItemIndex = orderItems.findIndex(
      (item) => item.ingredientId === ingredientId
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += quantity;
      setOrderItems(updatedItems);
    } else {
      // Add new item
      setOrderItems([...orderItems, { ingredientId, quantity }]);
    }

    toast({
      title: "Added to Order",
      description: `${getIngredientName(ingredientId)} added to your order`,
    });
  };

  // Handle removing item from order
  const handleRemoveFromOrder = (ingredientId: string) => {
    setOrderItems(
      orderItems.filter((item) => item.ingredientId !== ingredientId)
    );
  };

  // Handle placing order - Updated to replenish inventory to 100%
  const handlePlaceOrder = () => {
    if (orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Your order is empty",
        variant: "destructive",
      });
      return;
    }

    // Update inventory levels to 100% for ordered ingredients
    const updatedIngredients = [...ingredients];
    const orderedIngredientNames: string[] = [];

    orderItems.forEach((item) => {
      const ingredientIndex = updatedIngredients.findIndex(
        (ing) => ing.id === item.ingredientId
      );
      if (ingredientIndex !== -1) {
        // Set quantity to maxQuantity (100%)
        updatedIngredients[ingredientIndex].quantity =
          updatedIngredients[ingredientIndex].maxQuantity;
        orderedIngredientNames.push(updatedIngredients[ingredientIndex].name);
      }
    });

    // Update the ingredients state
    setIngredients(updatedIngredients);

    // Show success message
    setShowOrderSuccess(true);

    toast({
      title: "Order Placed Successfully",
      description: `Inventory replenished to 100% for: ${orderedIngredientNames.join(
        ", "
      )}`,
    });

    // Reset order after a delay
    setTimeout(() => {
      setOrderItems([]);
      setShowOrderSuccess(false);
    }, 3000);
  };

  // Update the handleRecordProduction function to use the new checkForLowStock function
  const handleRecordProduction = () => {
    if (productionData.recipeId === "" || productionData.tubs <= 0) {
      toast({
        title: "Error",
        description:
          "Please select a recipe and specify the number of tubs produced",
        variant: "destructive",
      });
      return;
    }

    const recipe = recipes.find((r) => r.id === productionData.recipeId);
    if (!recipe) return;

    // Update inventory based on production
    const updatedIngredients = [...ingredients];
    let lowStockAlert = false;

    recipe.ingredients.forEach((recipeIngredient) => {
      const ingredientIndex = updatedIngredients.findIndex(
        (i) => i.id === recipeIngredient.ingredientId
      );
      if (ingredientIndex !== -1) {
        const totalUsed = recipeIngredient.quantity * productionData.tubs;
        updatedIngredients[ingredientIndex].quantity -= totalUsed;

        // Check if stock is low based on percentage of max
        if (checkForLowStock(updatedIngredients[ingredientIndex])) {
          lowStockAlert = true;
        }
      }
    });

    setIngredients(updatedIngredients);
    setShowProductionDialog(false);
    setProductionData({
      recipeId: "",
      tubs: 0,
    });

    // Record the production entry
    const entry: ProductionEntry = {
      recipeId: productionData.recipeId,
      tubs: productionData.tubs,
      date: new Date().toISOString(),
    };

    toast({
      title: "Production Recorded",
      description: `${productionData.tubs} tubs of ${recipe.name} recorded and inventory updated`,
    });

    if (lowStockAlert) {
      toast({
        title: "Low Stock Alert",
        description:
          "Some ingredients are running low. Check the ordering widget.",
        variant: "destructive",
      });
    }
  };

  // Remove ingredient from recipe during creation
  const removeIngredientFromRecipe = (index: number) => {
    const updatedIngredients = [...newRecipe.ingredients];
    updatedIngredients.splice(index, 1);
    setNewRecipe({
      ...newRecipe,
      ingredients: updatedIngredients,
    });
  };

  // Remove alert
  const removeAlert = (index: number) => {
    const updatedAlerts = [...alerts];
    updatedAlerts.splice(index, 1);
    setAlerts(updatedAlerts);
  };

  // Get ingredient name by ID
  const getIngredientName = (id: string) => {
    const ingredient = ingredients.find((i) => i.id === id);
    return ingredient ? ingredient.name : "Unknown";
  };

  // Get ingredient unit by ID
  const getIngredientUnit = (id: string) => {
    const ingredient = ingredients.find((i) => i.id === id);
    return ingredient ? ingredient.unit : "";
  };

  // Get ingredient by ID
  const getIngredient = (id: string) => {
    return ingredients.find((i) => i.id === id);
  };

  // Calculate total order cost (placeholder function)
  const calculateOrderTotal = () => {
    return orderItems.length * 25.99; // Placeholder calculation
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main content */}
      <div className="w-full p-4 md:p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Welcome Back, Ignacio!</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Inventory Section */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Inventory</CardTitle>
              <div className="flex space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Add Ingredient
                    </Button>
                  </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Ingredient</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="ingredient-name">Name</Label>
                        <Input
                          id="ingredient-name"
                          value={newIngredient.name}
                          onChange={(e) =>
                            setNewIngredient({
                              ...newIngredient,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="ingredient-quantity">Quantity</Label>
                          <Input
                            id="ingredient-quantity"
                            type="number"
                            value={newIngredient.quantity}
                            onChange={(e) =>
                              setNewIngredient({
                                ...newIngredient,
                                quantity: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="ingredient-unit">Unit</Label>
                          <Input
                            id="ingredient-unit"
                            value={newIngredient.unit}
                            onChange={(e) =>
                              setNewIngredient({
                                ...newIngredient,
                                unit: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="ingredient-max-quantity">
                            Max Quantity
                          </Label>
                          <Input
                            id="ingredient-max-quantity"
                            type="number"
                            value={newIngredient.maxQuantity}
                            onChange={(e) =>
                              setNewIngredient({
                                ...newIngredient,
                                maxQuantity: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="ingredient-alert-threshold">
                            Alert Threshold (%)
                          </Label>
                          <Input
                            id="ingredient-alert-threshold"
                            type="number"
                            value={newIngredient.alertThreshold}
                            onChange={(e) =>
                              setNewIngredient({
                                ...newIngredient,
                                alertThreshold: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="ingredient-supplier">Supplier</Label>
                          <Input
                            id="ingredient-supplier"
                            value={newIngredient.supplier || ""}
                            onChange={(e) =>
                              setNewIngredient({
                                ...newIngredient,
                                supplier: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="ingredient-order-url">
                            Order URL
                          </Label>
                          <Input
                            id="ingredient-order-url"
                            value={newIngredient.orderUrl || ""}
                            onChange={(e) =>
                              setNewIngredient({
                                ...newIngredient,
                                orderUrl: e.target.value,
                              })
                            }
                            placeholder="https://example.com/order"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleAddIngredient}>
                        Add Ingredient
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium"
                  onClick={() => setShowProductionDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Record Production
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Inventory Chart with individual thresholds */}
              <div className="border rounded-md p-4 mb-6">
                <InventoryChart
                  ingredients={ingredients}
                  updateIngredientThreshold={updateIngredientThreshold}
                />
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {ingredients.map((ingredient) => {
                  const percentFull = Math.round(
                    (ingredient.quantity / ingredient.maxQuantity) * 100
                  );
                  const threshold = ingredient.alertThreshold || 20;
                  const isLow = percentFull < threshold;

                  return (
                    <Badge
                      key={ingredient.id}
                      variant="outline"
                      className={`text-sm py-1.5 px-3 ${
                        isLow
                          ? "bg-red-100 text-red-800"
                          : "bg-indigo-100 text-indigo-800"
                      }`}
                    >
                      {ingredient.name} - {ingredient.quantity}{" "}
                      {ingredient.unit} ({percentFull}%)
                      <span className="ml-1 text-xs opacity-70">
                        Alert: {threshold}%
                      </span>
                    </Badge>
                  );
                })}
              </div>

              <div className="mt-4 flex justify-end">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Inventory
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Inventory</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <ScrollArea className="h-[300px] pr-4">
                        {ingredients.map((ingredient) => (
                          <div
                            key={ingredient.id}
                            className="mb-4 pb-4 border-b last:border-0"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <Label htmlFor={`ingredient-${ingredient.id}`}>
                                {ingredient.name}
                              </Label>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label
                                  htmlFor={`quantity-${ingredient.id}`}
                                  className="text-xs"
                                >
                                  Current Quantity
                                </Label>
                                <Input
                                  id={`quantity-${ingredient.id}`}
                                  type="number"
                                  value={ingredient.quantity}
                                  onChange={(e) => {
                                    const updatedIngredients = ingredients.map(
                                      (item) =>
                                        item.id === ingredient.id
                                          ? {
                                              ...item,
                                              quantity: Number(e.target.value),
                                            }
                                          : item
                                    );
                                    setIngredients(updatedIngredients);
                                  }}
                                />
                              </div>
                              <div>
                                <Label
                                  htmlFor={`max-${ingredient.id}`}
                                  className="text-xs"
                                >
                                  Max Quantity
                                </Label>
                                <Input
                                  id={`max-${ingredient.id}`}
                                  type="number"
                                  value={ingredient.maxQuantity}
                                  onChange={(e) => {
                                    const updatedIngredients = ingredients.map(
                                      (item) =>
                                        item.id === ingredient.id
                                          ? {
                                              ...item,
                                              maxQuantity: Number(
                                                e.target.value
                                              ),
                                            }
                                          : item
                                    );
                                    setIngredients(updatedIngredients);
                                  }}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                              <div>
                                <Label
                                  htmlFor={`threshold-${ingredient.id}`}
                                  className="text-xs"
                                >
                                  Alert Threshold (%)
                                </Label>
                                <Input
                                  id={`threshold-${ingredient.id}`}
                                  type="number"
                                  value={ingredient.alertThreshold || 20}
                                  onChange={(e) => {
                                    const updatedIngredients = ingredients.map(
                                      (item) =>
                                        item.id === ingredient.id
                                          ? {
                                              ...item,
                                              alertThreshold: Number(
                                                e.target.value
                                              ),
                                            }
                                          : item
                                    );
                                    setIngredients(updatedIngredients);
                                  }}
                                />
                              </div>
                              <div>
                                <Label
                                  htmlFor={`supplier-${ingredient.id}`}
                                  className="text-xs"
                                >
                                  Supplier
                                </Label>
                                <Input
                                  id={`supplier-${ingredient.id}`}
                                  value={ingredient.supplier || ""}
                                  onChange={(e) => {
                                    const updatedIngredients = ingredients.map(
                                      (item) =>
                                        item.id === ingredient.id
                                          ? {
                                              ...item,
                                              supplier: e.target.value,
                                            }
                                          : item
                                    );
                                    setIngredients(updatedIngredients);
                                  }}
                                />
                              </div>
                            </div>
                            <div className="grid gap-2 mt-2">
                              <Label
                                htmlFor={`orderUrl-${ingredient.id}`}
                                className="text-xs"
                              >
                                Order URL
                              </Label>
                              <Input
                                id={`orderUrl-${ingredient.id}`}
                                value={ingredient.orderUrl || ""}
                                onChange={(e) => {
                                  const updatedIngredients = ingredients.map(
                                    (item) =>
                                      item.id === ingredient.id
                                        ? { ...item, orderUrl: e.target.value }
                                        : item
                                  );
                                  setIngredients(updatedIngredients);
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Order Ingredients Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Order Ingredients
              </CardTitle>
            </CardHeader>
            <CardContent
              className="flex flex-col"
              style={{ minHeight: "400px" }}
            >
              {showOrderSuccess ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="bg-green-100 text-green-800 rounded-full p-3 mb-3">
                    <Check className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">Order Placed!</h3>
                  <p className="text-sm text-muted-foreground text-center mb-2">
                    Your order has been submitted to suppliers
                  </p>
                  <p className="text-sm font-medium text-green-600">
                    Inventory replenished to 100%
                  </p>
                </div>
              ) : getLowStockIngredients().length > 0 ? (
                <div className="space-y-4 flex flex-col flex-1">
                  <div className="text-sm text-muted-foreground mb-2">
                    The following ingredients are below their alert thresholds:
                  </div>

                  <ScrollArea className="h-[300px] flex-1">
                    <div className="space-y-3">
                      {getLowStockIngredients().map((ingredient) => {
                        const percentFull = Math.round(
                          (ingredient.quantity / ingredient.maxQuantity) * 100
                        );
                        const threshold = ingredient.alertThreshold || 20;
                        const orderAmount = Math.ceil(
                          ingredient.maxQuantity - ingredient.quantity
                        );
                        const isInOrder = orderItems.some(
                          (item) => item.ingredientId === ingredient.id
                        );

                        return (
                          <div
                            key={ingredient.id}
                            className="border rounded-md p-3"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <span className="font-medium">
                                  {ingredient.name}
                                </span>
                                <div className="text-sm text-muted-foreground">
                                  {ingredient.quantity} /{" "}
                                  {ingredient.maxQuantity} {ingredient.unit} (
                                  {percentFull}%)
                                </div>
                                <div className="text-xs text-red-600">
                                  Below {threshold}% threshold
                                </div>
                                {ingredient.supplier && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Supplier: {ingredient.supplier}
                                  </div>
                                )}
                              </div>
                              {isInOrder ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600"
                                  onClick={() =>
                                    handleRemoveFromOrder(ingredient.id)
                                  }
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Added
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleAddToOrder(ingredient.id, orderAmount)
                                  }
                                >
                                  Add to Order
                                </Button>
                              )}
                            </div>
                            {ingredient.orderUrl && (
                              <a
                                href={ingredient.orderUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline flex items-center"
                              >
                                View supplier page{" "}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>

                  {orderItems.length > 0 && (
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Order Summary</span>
                        <span>{orderItems.length} items</span>
                      </div>
                      <div className="flex justify-between text-sm mb-4">
                        <span>Estimated Total:</span>
                        <span className="font-medium">
                          ${calculateOrderTotal().toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2 italic">
                        Ordering will replenish ingredients to 100% capacity
                      </div>
                      <Button className="w-full" onClick={handlePlaceOrder}>
                        Place Order
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="bg-green-100 text-green-800 rounded-full p-3 mb-3">
                    <Check className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">All Stocked Up!</h3>
                  <p className="text-sm text-muted-foreground">
                    All ingredients are above their alert thresholds
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recipe Cards Section */}
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recipe Cards</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Add Recipe
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Recipe</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="recipe-name">Recipe Name</Label>
                    <Input
                      id="recipe-name"
                      value={newRecipe.name}
                      onChange={(e) =>
                        setNewRecipe({ ...newRecipe, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Ingredients</Label>
                    <div className="flex space-x-2">
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={tempIngredient.ingredientId}
                        onChange={(e) =>
                          setTempIngredient({
                            ...tempIngredient,
                            ingredientId: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Ingredient</option>
                        {ingredients.map((ingredient) => (
                          <option key={ingredient.id} value={ingredient.id}>
                            {ingredient.name} ({ingredient.unit})
                          </option>
                        ))}
                      </select>
                      <Input
                        type="number"
                        placeholder="Qty"
                        className="w-24"
                        value={tempIngredient.quantity}
                        onChange={(e) =>
                          setTempIngredient({
                            ...tempIngredient,
                            quantity: Number(e.target.value),
                          })
                        }
                      />
                      <Button
                        type="button"
                        onClick={handleAddIngredientToRecipe}
                      >
                        Add
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2"
                      onClick={() => setShowAddIngredientInRecipe(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Ingredient
                    </Button>
                  </div>

                  {newRecipe.ingredients.length > 0 && (
                    <div className="border rounded-md p-3">
                      <Label className="mb-2 block">Recipe Ingredients:</Label>
                      <ScrollArea className="h-32">
                        <div className="space-y-2">
                          {newRecipe.ingredients.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-2 bg-muted/50 rounded-md"
                            >
                              <span>
                                {getIngredientName(item.ingredientId)} -{" "}
                                {item.quantity}{" "}
                                {getIngredientUnit(item.ingredientId)}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removeIngredientFromRecipe(index)
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                  {showAddIngredientInRecipe && (
                    <div className="border rounded-md p-4 mt-4 bg-muted/20">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Add New Ingredient</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAddIngredientInRecipe(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="new-ingredient-name">Name</Label>
                          <Input
                            id="new-ingredient-name"
                            value={newIngredient.name}
                            onChange={(e) =>
                              setNewIngredient({
                                ...newIngredient,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="new-ingredient-quantity">
                              Initial Quantity
                            </Label>
                            <Input
                              id="new-ingredient-quantity"
                              type="number"
                              value={newIngredient.quantity}
                              onChange={(e) =>
                                setNewIngredient({
                                  ...newIngredient,
                                  quantity: Number(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="new-ingredient-unit">Unit</Label>
                            <Input
                              id="new-ingredient-unit"
                              value={newIngredient.unit}
                              onChange={(e) =>
                                setNewIngredient({
                                  ...newIngredient,
                                  unit: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="new-ingredient-max-quantity">
                              Max Quantity
                            </Label>
                            <Input
                              id="new-ingredient-max-quantity"
                              type="number"
                              value={newIngredient.maxQuantity}
                              onChange={(e) =>
                                setNewIngredient({
                                  ...newIngredient,
                                  maxQuantity: Number(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="new-ingredient-alert-threshold">
                              Alert Threshold (%)
                            </Label>
                            <Input
                              id="new-ingredient-alert-threshold"
                              type="number"
                              value={newIngredient.alertThreshold || 20}
                              onChange={(e) =>
                                setNewIngredient({
                                  ...newIngredient,
                                  alertThreshold: Number(e.target.value),
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="new-ingredient-supplier">
                            Supplier (Optional)
                          </Label>
                          <Input
                            id="new-ingredient-supplier"
                            value={newIngredient.supplier || ""}
                            onChange={(e) =>
                              setNewIngredient({
                                ...newIngredient,
                                supplier: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="new-ingredient-order-url">
                            Order URL (Optional)
                          </Label>
                          <Input
                            id="new-ingredient-order-url"
                            value={newIngredient.orderUrl || ""}
                            onChange={(e) =>
                              setNewIngredient({
                                ...newIngredient,
                                orderUrl: e.target.value,
                              })
                            }
                            placeholder="https://example.com/order"
                          />
                        </div>
                        <Button
                          onClick={handleAddIngredientDuringRecipeCreation}
                          className="w-full mt-2"
                        >
                          Add & Select Ingredient
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleAddRecipe}>Create Recipe</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h3 className="font-medium mb-2">{recipe.name}</h3>
                  <div className="text-sm text-muted-foreground">
                    {recipe.ingredients.map((item, index) => (
                      <div key={index}>
                        {getIngredientName(item.ingredientId)}: {item.quantity}{" "}
                        {getIngredientUnit(item.ingredientId)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <Dialog>
                <DialogTrigger asChild>
                  <div className="border rounded-lg p-4 flex items-center justify-center h-32 hover:bg-muted/50 transition-colors cursor-pointer">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Recipe</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="recipe-name">Recipe Name</Label>
                      <Input
                        id="recipe-name"
                        value={newRecipe.name}
                        onChange={(e) =>
                          setNewRecipe({ ...newRecipe, name: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Ingredients</Label>
                      <div className="flex space-x-2">
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={tempIngredient.ingredientId}
                          onChange={(e) =>
                            setTempIngredient({
                              ...tempIngredient,
                              ingredientId: e.target.value,
                            })
                          }
                        >
                          <option value="">Select Ingredient</option>
                          {ingredients.map((ingredient) => (
                            <option key={ingredient.id} value={ingredient.id}>
                              {ingredient.name} ({ingredient.unit})
                            </option>
                          ))}
                        </select>
                        <Input
                          type="number"
                          placeholder="Qty"
                          className="w-24"
                          value={tempIngredient.quantity}
                          onChange={(e) =>
                            setTempIngredient({
                              ...tempIngredient,
                              quantity: Number(e.target.value),
                            })
                          }
                        />
                        <Button
                          type="button"
                          onClick={handleAddIngredientToRecipe}
                        >
                          Add
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2"
                        onClick={() => setShowAddIngredientInRecipe(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Ingredient
                      </Button>
                    </div>

                    {newRecipe.ingredients.length > 0 && (
                      <div className="border rounded-md p-3">
                        <Label className="mb-2 block">
                          Recipe Ingredients:
                        </Label>
                        <ScrollArea className="h-32">
                          <div className="space-y-2">
                            {newRecipe.ingredients.map((item, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center p-2 bg-muted/50 rounded-md"
                              >
                                <span>
                                  {getIngredientName(item.ingredientId)} -{" "}
                                  {item.quantity}{" "}
                                  {getIngredientUnit(item.ingredientId)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    removeIngredientFromRecipe(index)
                                  }
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                    {showAddIngredientInRecipe && (
                      <div className="border rounded-md p-4 mt-4 bg-muted/20">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium">Add New Ingredient</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAddIngredientInRecipe(false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="new-ingredient-name">Name</Label>
                            <Input
                              id="new-ingredient-name"
                              value={newIngredient.name}
                              onChange={(e) =>
                                setNewIngredient({
                                  ...newIngredient,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="new-ingredient-quantity">
                                Initial Quantity
                              </Label>
                              <Input
                                id="new-ingredient-quantity"
                                type="number"
                                value={newIngredient.quantity}
                                onChange={(e) =>
                                  setNewIngredient({
                                    ...newIngredient,
                                    quantity: Number(e.target.value),
                                  })
                                }
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="new-ingredient-unit">Unit</Label>
                              <Input
                                id="new-ingredient-unit"
                                value={newIngredient.unit}
                                onChange={(e) =>
                                  setNewIngredient({
                                    ...newIngredient,
                                    unit: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="new-ingredient-max-quantity">
                                Max Quantity
                              </Label>
                              <Input
                                id="new-ingredient-max-quantity"
                                type="number"
                                value={newIngredient.maxQuantity}
                                onChange={(e) =>
                                  setNewIngredient({
                                    ...newIngredient,
                                    maxQuantity: Number(e.target.value),
                                  })
                                }
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="new-ingredient-alert-threshold">
                                Alert Threshold (%)
                              </Label>
                              <Input
                                id="new-ingredient-alert-threshold"
                                type="number"
                                value={newIngredient.alertThreshold || 20}
                                onChange={(e) =>
                                  setNewIngredient({
                                    ...newIngredient,
                                    alertThreshold: Number(e.target.value),
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="new-ingredient-supplier">
                              Supplier (Optional)
                            </Label>
                            <Input
                              id="new-ingredient-supplier"
                              value={newIngredient.supplier || ""}
                              onChange={(e) =>
                                setNewIngredient({
                                  ...newIngredient,
                                  supplier: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="new-ingredient-order-url">
                              Order URL (Optional)
                            </Label>
                            <Input
                              id="new-ingredient-order-url"
                              value={newIngredient.orderUrl || ""}
                              onChange={(e) =>
                                setNewIngredient({
                                  ...newIngredient,
                                  orderUrl: e.target.value,
                                })
                              }
                              placeholder="https://example.com/order"
                            />
                          </div>
                          <Button
                            onClick={handleAddIngredientDuringRecipeCreation}
                            className="w-full mt-2"
                          >
                            Add & Select Ingredient
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleAddRecipe}>Create Recipe</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Dialog */}
      <Dialog
        open={showProductionDialog}
        onOpenChange={setShowProductionDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Daily Production</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="recipe-select">Select Recipe</Label>
              <select
                id="recipe-select"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={productionData.recipeId}
                onChange={(e) =>
                  setProductionData({
                    ...productionData,
                    recipeId: e.target.value,
                  })
                }
              >
                <option value="">Select Recipe</option>
                {recipes.map((recipe) => (
                  <option key={recipe.id} value={recipe.id}>
                    {recipe.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tubs-produced">Tubs Produced</Label>
              <Input
                id="tubs-produced"
                type="number"
                value={productionData.tubs}
                onChange={(e) =>
                  setProductionData({
                    ...productionData,
                    tubs: Number(e.target.value),
                  })
                }
              />
            </div>

            {productionData.recipeId && (
              <div className="border rounded-md p-3 bg-muted/50">
                <h4 className="font-medium mb-2">Inventory Impact:</h4>
                <div className="space-y-1 text-sm">
                  {recipes
                    .find((r) => r.id === productionData.recipeId)
                    ?.ingredients.map((item, index) => {
                      const ingredient = ingredients.find(
                        (i) => i.id === item.ingredientId
                      );
                      const totalUsed = item.quantity * productionData.tubs;
                      const remaining = ingredient
                        ? ingredient.quantity - totalUsed
                        : 0;
                      const percentRemaining = ingredient
                        ? Math.round((remaining / ingredient.maxQuantity) * 100)
                        : 0;
                      const threshold = ingredient?.alertThreshold || 20;
                      const isLow = percentRemaining < threshold;

                      return (
                        <div key={index} className="flex justify-between">
                          <span>{getIngredientName(item.ingredientId)}</span>
                          <span
                            className={isLow ? "text-red-600 font-medium" : ""}
                          >
                            -{totalUsed} {getIngredientUnit(item.ingredientId)}
                            (Remaining: {remaining}{" "}
                            {getIngredientUnit(item.ingredientId)} -{" "}
                            {percentRemaining}%)
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowProductionDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRecordProduction}>Record Production</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
