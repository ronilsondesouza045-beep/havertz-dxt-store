import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/ui/Card';
import { Shield, FileText, Scale, Lock, MessageCircle, AlertTriangle } from 'lucide-react';

export default function Terms() {
  const sections = [
    {
      title: "1. SOBRE A PLATAFORMA",
      icon: <FileText className="text-neon-green" />,
      content: "A HAVERTZ.DXT é uma plataforma digital utilizada para organização de pedidos, atendimento online, suporte ao cliente, venda de serviços digitais e gerenciamento manual de entregas. Todos os pedidos passam por análise antes da confirmação."
    },
    {
      title: "2. FUNCIONAMENTO DOS PEDIDOS",
      icon: <Scale className="text-neon-purple" />,
      content: "Os pedidos realizados na plataforma são processados manualmente. O prazo pode variar conforme horário da compra, fila de atendimento, confirmação do pagamento e disponibilidade operacional. O envio somente será iniciado após confirmação do pagamento."
    },
    {
      title: "3. RESPONSABILIDADE DO CLIENTE",
      icon: <AlertTriangle className="text-orange-500" />,
      content: "O cliente é totalmente responsável pelas informações enviadas no pedido (Nick IMVU, ID Free Fire, @Instagram, Email, WhatsApp). Informações incorretas podem causar atraso, cancelamento ou impossibilidade de entrega."
    },
    {
      title: "6. SERVIÇOS DIGITAIS",
      icon: <Shield className="text-blue-500" />,
      content: "Alguns serviços dependem de plataformas externas e podem sofrer limitações, alterações, indisponibilidade ou oscilações. A HAVERTZ.DXT não possui vínculo oficial com IMVU, Instagram, Garena, Netflix, Disney, Prime Video, Paramount, Globoplay ou qualquer outra marca citada."
    }
  ];

  return (
    <MainLayout>
      <div className="container mx-auto py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-black text-white italic mb-4 uppercase tracking-tighter">
              TERMOS DE <span className="text-neon-green">USO</span>
            </h1>
            <p className="text-zinc-500 font-black italic uppercase tracking-widest text-sm">
              Última atualização: Maio de 2026
            </p>
          </div>

          <div className="grid gap-8">
            <Card className="p-8 bg-zinc-950/50 border-zinc-900 leading-relaxed text-zinc-400">
              <p className="mb-6">
                Bem-vindo à <span className="text-white font-bold">HAVERTZ.DXT</span>. Ao acessar, navegar ou utilizar a plataforma, o usuário declara estar de acordo com os termos abaixo.
              </p>

              <div className="space-y-12">
                {sections.map((section, idx) => (
                  <div key={idx} className="group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-700 transition-colors">
                        {section.icon}
                      </div>
                      <h2 className="text-xl font-black text-white italic uppercase tracking-tight">{section.title}</h2>
                    </div>
                    <p className="pl-14 text-sm leading-relaxed border-l border-zinc-900 group-hover:border-neon-green/30 transition-colors">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-12 space-y-8 pt-12 border-t border-zinc-900">
                <div>
                   <h3 className="text-lg font-black text-white italic uppercase mb-3 text-red-500">9. SEGURANÇA</h3>
                   <p className="text-sm">
                     A plataforma <span className="font-bold underline">NÃO solicita</span>: senha IMVU, senha Instagram, token, cookie, acesso remoto ou dados bancários completos. <span className="text-white">Nunca compartilhe suas senhas pessoais.</span>
                   </p>
                </div>

                <div>
                   <h3 className="text-lg font-black text-white italic uppercase mb-3">10. CHAT E SUPORTE ONLINE</h3>
                   <p className="text-sm">
                     O usuário concorda em manter respeito no atendimento, não enviar spam, conteúdo ilegal ou ameaçar operadores. Conversas poderão ser armazenadas para segurança e histórico.
                   </p>
                </div>

                <Card className="bg-zinc-900/30 border-zinc-800 p-6 text-center">
                   <h3 className="text-lg font-black text-white italic uppercase mb-2">14. ACEITE</h3>
                   <p className="text-xs uppercase font-black tracking-widest text-zinc-500">
                     Ao continuar utilizando a plataforma, o usuário declara ter lido e aceitado todos os termos acima.
                   </p>
                </Card>
              </div>
            </Card>

            <div className="text-center text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em] mt-8">
              HAVERTZ.DXT — ATENDIMENTO DIGITAL ORGANIZADO.
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
