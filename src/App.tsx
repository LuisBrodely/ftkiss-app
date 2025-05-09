import { useState, useEffect } from "react"
import {
  format,
  addDays,
  startOfDay,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
} from "date-fns"
import { es } from "date-fns/locale"
import { Plus, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Tipos
type Habit = {
  id: string
  name: string
  completions: Date[]
  color: string
}

// Colores disponibles para los hábitos
const COLORS = ["bg-green-500", "bg-blue-500", "bg-red-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500"]

function App() {
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: "1",
      name: "Ejercicio",
      completions: [new Date(2025, 4, 1), new Date(2025, 4, 3), new Date(2025, 4, 5), new Date(2025, 4, 7)],
      color: COLORS[0],
    },
    {
      id: "2",
      name: "Leer",
      completions: [new Date(2025, 4, 2), new Date(2025, 4, 3), new Date(2025, 4, 4), new Date(2025, 4, 6)],
      color: COLORS[1],
    },
    {
      id: "3",
      name: "Meditar",
      completions: [new Date(2025, 4, 1), new Date(2025, 4, 2), new Date(2025, 4, 4), new Date(2025, 4, 8)],
      color: COLORS[2],
    },
  ])

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [dates, setDates] = useState<Date[]>([])
  const [newHabitName, setNewHabitName] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null)
  const [editedHabitName, setEditedHabitName] = useState("")

  // Generar fechas para el mes actual
  useEffect(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
    setDates(daysInMonth)
  }, [currentMonth])

  // Manejar la adición de un nuevo hábito
  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      const newHabit: Habit = {
        id: Date.now().toString(),
        name: newHabitName,
        completions: [],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      }
      setHabits([...habits, newHabit])
      setNewHabitName("")
      setIsAddDialogOpen(false)
    }
  }

  // Manejar la edición de un hábito
  const handleEditHabit = () => {
    if (habitToEdit && editedHabitName.trim()) {
      setHabits(habits.map((habit) => (habit.id === habitToEdit.id ? { ...habit, name: editedHabitName } : habit)))
      setIsEditDialogOpen(false)
      setHabitToEdit(null)
      setEditedHabitName("")
    }
  }

  // Abrir el diálogo de edición
  const openEditDialog = (habit: Habit) => {
    setHabitToEdit(habit)
    setEditedHabitName(habit.name)
    setIsEditDialogOpen(true)
  }

  // Manejar la eliminación de un hábito
  const handleDeleteHabit = () => {
    if (habitToDelete) {
      setHabits(habits.filter((habit) => habit.id !== habitToDelete))
      setIsDeleteDialogOpen(false)
      setHabitToDelete(null)
    }
  }

  // Abrir el diálogo de confirmación de eliminación
  const openDeleteDialog = (habitId: string) => {
    setHabitToDelete(habitId)
    setIsDeleteDialogOpen(true)
  }

  // Manejar el toggle de completado de un hábito
  const toggleHabitCompletion = (habitId: string, date: Date) => {
    setHabits(
      habits.map((habit) => {
        if (habit.id === habitId) {
          const isCompleted = habit.completions.some((d) => isSameDay(d, date))

          if (isCompleted) {
            // Remover la fecha si ya está completada
            return {
              ...habit,
              completions: habit.completions.filter((d) => !isSameDay(d, date)),
            }
          } else {
            // Añadir la fecha si no está completada
            return {
              ...habit,
              completions: [...habit.completions, date],
            }
          }
        }
        return habit
      }),
    )
  }

  // Mover al mes anterior
  const movePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  // Mover al mes siguiente
  const moveNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  // Calcular estadísticas para cada hábito
  const getHabitStats = (habit: Habit) => {
    // Ordenar completions por fecha
    const sortedCompletions = [...habit.completions].sort((a, b) => a.getTime() - b.getTime())

    // Contar total
    const total = sortedCompletions.length

    // Calcular racha actual
    let currentStreak = 0
    const today = startOfDay(new Date())
    let checkDate = today

    while (sortedCompletions.some((date) => isSameDay(date, checkDate))) {
      currentStreak++
      checkDate = addDays(checkDate, -1)
    }

    // Calcular racha más larga
    let longestStreak = 0
    let currentLongestStreak = 0

    for (let i = 0; i < sortedCompletions.length; i++) {
      if (i === 0 || isSameDay(addDays(sortedCompletions[i - 1], 1), sortedCompletions[i])) {
        currentLongestStreak++
      } else {
        currentLongestStreak = 1
      }

      if (currentLongestStreak > longestStreak) {
        longestStreak = currentLongestStreak
      }
    }

    return { currentStreak, longestStreak, total }
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-green-500 w-8 h-8 mr-2 rounded-sm"></div>
          <h1 className="text-2xl font-bold">Ftkiss</h1>
        </div>
        <div>
          <span className="mr-4">Usuario</span>
        </div>
      </header>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">TODOS LOS HÁBITOS</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={movePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium mx-2">{format(currentMonth, "MMMM yyyy", { locale: es })}</span>
          <Button variant="outline" size="icon" onClick={moveNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* Encabezado del calendario */}
          <div className="grid grid-cols-[200px_repeat(31,minmax(40px,1fr))] gap-1 mb-2">
            <div className="font-medium"></div>
            {dates.map((date, index) => (
              <div key={index} className="text-center">
                <div className="font-bold">{format(date, "d", { locale: es })}</div>
                <div className="text-xs uppercase">{format(date, "EEE", { locale: es })}</div>
              </div>
            ))}
          </div>

          {/* Filas de hábitos */}
          <div className="space-y-2">
            {habits.map((habit) => {
              const stats = getHabitStats(habit)

              return (
                <div key={habit.id} className="grid grid-cols-[200px_repeat(31,minmax(40px,1fr))] gap-1">
                  <div className="flex items-center justify-between pr-2">
                    <div className="flex items-center">
                      <div className={cn("w-4 h-4 rounded-sm mr-2", habit.color)}></div>
                      <span className="font-medium">{habit.name}</span>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditDialog(habit)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => openDeleteDialog(habit.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {dates.map((date, dateIndex) => {
                    const isCompleted = habit.completions.some((d) => isSameDay(d, date))

                    return (
                      <button
                        key={dateIndex}
                        className={cn(
                          "h-10 w-full rounded-sm transition-colors",
                          isCompleted ? habit.color : "bg-gray-100 hover:bg-gray-200",
                        )}
                        onClick={() => toggleHabitCompletion(habit.id, date)}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>

          {/* Fila para añadir nuevo hábito */}
          <div className="grid grid-cols-[200px_repeat(31,minmax(40px,1fr))] gap-1 mt-4">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  <span>Nuevo Hábito</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Añadir nuevo hábito</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Nombre del hábito"
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddHabit}>Añadir</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Celdas vacías para la fila de nuevo hábito */}
            {dates.map((_, index) => (
              <div key={index} className="h-10"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {habits.map((habit) => {
          const stats = getHabitStats(habit)

          return (
            <div key={habit.id} className="border rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className={cn("w-4 h-4 rounded-sm mr-2", habit.color)}></div>
                <h3 className="font-medium">{habit.name}</h3>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-2xl font-bold">{stats.currentStreak}</div>
                  <div className="text-xs text-gray-500">racha actual</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.longestStreak}</div>
                  <div className="text-xs text-gray-500">racha más larga</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-xs text-gray-500">total</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Diálogo de edición de hábito */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar hábito</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Nombre del hábito"
                value={editedHabitName}
                onChange={(e) => setEditedHabitName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditHabit}>Guardar</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este hábito y todos sus registros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteHabit} className="bg-red-500 hover:bg-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default App