import React from 'react';
import { motion } from 'motion/react';
import { Users, BookOpen, Clock, Heart, UsersRound, Calendar, ArrowRight } from 'lucide-react';
import { AdminStats } from '../../types';

interface AdminDashboardProps {
  stats: AdminStats;
  setAdminSubView: (view: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats, setAdminSubView }) => {
  const statCards = [
    { id: 'students', label: 'Alumnos', value: stats.students, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', view: 'students' },
    { id: 'books', label: 'Libros', value: stats.books, icon: BookOpen, color: 'text-violet-600', bg: 'bg-violet-50', view: 'books' },
    { id: 'bookings', label: 'Donaciones Activas', value: stats.bookings, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', view: 'bookings' },
    { id: 'donations', label: 'Donaciones Completadas', value: stats.donations, icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50', view: 'donations' },
    { id: 'requests', label: 'Solicitudes Pendientes', value: stats.requests, icon: UsersRound, color: 'text-emerald-600', bg: 'bg-emerald-50', view: 'requests' },
    { id: 'history', label: 'Cierres de Periodo', value: 'Ver', icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50', view: 'history' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, idx) => (
        <motion.button
          key={stat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          onClick={() => setAdminSubView(stat.view)}
          className="glass-card p-6 rounded-3xl text-left card-hover group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-violet-200 group-hover:text-violet-400 transition-colors" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-violet-950">{stat.value}</p>
            <p className="text-sm font-medium text-violet-400">{stat.label}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
};
