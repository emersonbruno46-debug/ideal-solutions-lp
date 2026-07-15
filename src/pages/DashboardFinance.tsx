import { useState, useEffect } from "react";
import { useBusiness } from "@/hooks/useBusiness";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, ArrowDownRight, ArrowUpRight, TrendingUp, Plus, Trash2, PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { toast } from "sonner";
import { format } from "date-fns";

type Transaction = {
  id: string;
  type: "receita" | "despesa";
  amount: number;
  description: string;
  date: string;
};

const DashboardFinance = () => {
  const { data: business } = useBusiness();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  // Form
  const [type, setType] = useState<"receita" | "despesa">("receita");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (business) {
      const stored = localStorage.getItem(`finance_${business.id}`);
      if (stored) setTransactions(JSON.parse(stored));
      else {
        // mock 
        const mock: Transaction[] = [
          { id: "1", type: "receita", amount: 2000, description: "Cortes Semana", date: new Date().toISOString() },
          { id: "2", type: "despesa", amount: 500, description: "Compra de Produtos", date: new Date().toISOString() }
        ];
        setTransactions(mock);
      }
    }
  }, [business]);

  const saveTransactions = (newTx: Transaction[]) => {
    setTransactions(newTx);
    if (business) localStorage.setItem(`finance_${business.id}`, JSON.stringify(newTx));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount.replace(",", "."));
    if (isNaN(val) || val <= 0) return toast.error("Valor inválido");
    
    const newTx: Transaction = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      amount: val,
      description,
      date: new Date().toISOString()
    };
    
    saveTransactions([newTx, ...transactions]);
    setIsOpen(false);
    setAmount("");
    setDescription("");
  };

  const removeTx = (id: string) => {
    saveTransactions(transactions.filter(t => t.id !== id));
  };

  const totalReceitas = transactions.filter(t => t.type === "receita").reduce((acc, curr) => acc + curr.amount, 0);
  const totalDespesas = transactions.filter(t => t.type === "despesa").reduce((acc, curr) => acc + curr.amount, 0);
  const lucro = totalReceitas - totalDespesas;

  const chartData = [
    { name: "Faturamentos", value: Math.max(0, totalReceitas), color: "#25D366" },
    { name: "Gastos", value: Math.max(0, totalDespesas), color: "#ef4444" }
  ].filter(d => d.value > 0);

  return (
    <div className="pb-10 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#132239] to-[#202C3C] flex items-center justify-center shadow-lg">
            <Wallet className="w-6 h-6 text-[#2AD467]" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-extrabold mb-0.5 tracking-tight">Painel Financeiro</h1>
            <p className="text-muted-foreground text-sm">Registre e acompanhe seus lucros, faturamentos e gastos.</p>
          </div>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary gap-2 h-11 rounded-xl shadow-lg border-0 shrink-0">
              <Plus className="w-5 h-5" /> Registrar Valor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle>Nova Transação</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Button type="button" onClick={() => setType("receita")} variant="outline" className={`h-11 border-2 ${type === "receita" ? "border-[#25D366] bg-[#25D366]/10 text-[#25D366] shadow-sm font-bold" : ""}`}>
                  <ArrowUpRight className="w-4 h-4 mr-1.5" /> Faturamento
                </Button>
                <Button type="button" onClick={() => setType("despesa")} variant="outline" className={`h-11 border-2 ${type === "despesa" ? "border-red-500 bg-red-500/10 text-red-600 shadow-sm" : ""}`}>
                  <ArrowDownRight className="w-4 h-4 mr-1.5" /> Gasto
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Pagamento de Fornecedor, Corte..." required className="h-11 rounded-xl" />
              </div>
              
              <div className="space-y-2">
                <Label>Valor Total (R$)</Label>
                <Input value={amount} onChange={e => setAmount(e.target.value)} type="number" step="0.01" min="0.01" placeholder="0.00" required className="h-11 rounded-xl" />
              </div>

              <Button type="submit" className="w-full h-11 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold shadow rounded-xl mt-4 border-0">Salvar Registro</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="card-premium rounded-3xl p-6 bg-gradient-to-br from-[#132239] to-[#202C3C] text-white border-0 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#2AD467]/15 blur-3xl group-hover:bg-[#2AD467]/25 transition-all" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-[#2AD467]" />
              </div>
              <p className="text-sm font-black text-gray-400 uppercase tracking-wider">Faturamentos</p>
            </div>
            <p className="text-3xl font-black">R$ {totalReceitas.toFixed(2).replace(".", ",")}</p>
          </div>
        </div>

        <div className="card-premium rounded-3xl p-6 bg-gradient-to-br from-[#132239] to-[#202C3C] text-white border-0 overflow-hidden relative group">
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-500/10 blur-3xl group-hover:bg-red-500/20 transition-all" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-sm font-black text-gray-400 uppercase tracking-wider">Gastos</p>
            </div>
            <p className="text-3xl font-black">R$ {totalDespesas.toFixed(2).replace(".", ",")}</p>
          </div>
        </div>

        <div className="card-premium rounded-3xl p-6 bg-gradient-to-br from-[#132239] to-[#202C3C] text-white border-0 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#2AD467]/15 blur-3xl group-hover:bg-[#2AD467]/25 transition-all" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#2AD467]" />
              </div>
              <p className="text-sm font-black text-gray-400 uppercase tracking-wider">Lucro Líquido</p>
            </div>
            <p className={`text-3xl font-black ${lucro >= 0 ? "text-[#2AD467]" : "text-red-400"}`}>
              R$ {lucro.toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-gradient-to-br from-[#132239] to-[#202C3C] rounded-3xl p-6 flex flex-col overflow-hidden relative group">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#2AD467]/10 blur-3xl group-hover:bg-[#2AD467]/20 transition-all" />
          <div className="relative z-10 flex flex-col flex-1">
            <h2 className="font-display font-black flex items-center gap-2 mb-6 text-white">
              <PieChartIcon className="w-5 h-5 text-[#2AD467]" /> Visão Circular
            </h2>
            <div className="flex-1 min-h-[250px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                  Nenhum dado para exibir.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-gradient-to-br from-[#132239] to-[#202C3C] rounded-3xl p-6 overflow-hidden flex flex-col relative group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#2AD467]/10 blur-3xl group-hover:bg-[#2AD467]/15 transition-all" />
          <div className="relative z-10">
            <h2 className="font-display font-black flex items-center gap-2 mb-6 text-white">
              <Wallet className="w-5 h-5 text-[#2AD467]" /> Histórico de Lançamentos
            </h2>
          <div className="flex-1 max-h-[300px] overflow-y-auto pr-2 space-y-3">
            {!transactions.length ? (
              <div className="text-center py-10 text-gray-500 text-sm">
                Nenhuma transação registrada. Comece adicionando faturamentos ou gastos.
              </div>
            ) : (
              transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${t.type === 'receita' ? 'bg-[#2AD467]/15' : 'bg-red-500/15'}`}>
                      {t.type === 'receita' ? <ArrowUpRight className="w-5 h-5 text-[#2AD467]" /> : <ArrowDownRight className="w-5 h-5 text-red-400" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">{t.description}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{format(new Date(t.date), "dd/MM/yyyy 'às' HH:mm")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className={`font-black shrink-0 ${t.type === 'receita' ? 'text-[#2AD467]' : 'text-red-400'}`}>
                      {t.type === 'receita' ? '+' : '-'} R$ {t.amount.toFixed(2).replace(".", ",")}
                    </p>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:bg-red-500/10 hover:text-red-400 shrink-0 transition-colors" onClick={() => removeTx(t.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFinance;
