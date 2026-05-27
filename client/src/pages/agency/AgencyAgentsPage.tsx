import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Loader from '@/components/Loader/Loader';
import { getAgencyById } from './api/agency.api';
import { deleteAgent } from './api/agent.api';
import type { IAgencyWD, IAgents } from './interfaces';
import CreateAgentDialog from './components/CreateAgentDialog';
import EditAgentDialog from './components/EditAgentDialog';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';
import { Search } from 'lucide-react';
import type { ILoader } from '../dashboard/interface';
import { useTranslation } from 'react-i18next';

const AgencyAgentsPage: React.FC = () => {
  const { t } = useTranslation();

  const { agencyId } = useParams<{ agencyId: string }>();
  const navigate = useNavigate();
  
  const [agency, setAgency] = useState<IAgencyWD | null>(null);
  const [agents, setAgents] = useState<IAgents[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<IAgents[]>([]);
  const [loading, setLoading] = useState<ILoader>({
    isLoading: true,
    message: t('AgencyAgentsPage.loader.loadingAgents'),
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<IAgents | null>(null);

  useEffect(() => {
    if (agencyId) {
      fetchAgencyAndAgents();
    }
  }, [agencyId]);

  useEffect(() => {
    const filtered = agents.filter(agent =>
      agent.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.agentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.agentPhone.includes(searchTerm)
    );
    setFilteredAgents(filtered);
  }, [searchTerm, agents]);

  const fetchAgencyAndAgents = async () => {
    if (!agencyId) return;

    setLoading({
      isLoading: true,
      message: t('AgencyAgentsPage.loader.loadingAgents'),
    });
    try {
      const response = await getAgencyById(agencyId);
      if (response.success) {
        setAgency(response.data);
        setAgents(response.data.Agents || []);
        setFilteredAgents(response.data.Agents || []);
      }
    } catch (error) {
      console.error('Failed to fetch agency and agents:', error);
    } finally {
      setLoading({
        isLoading: false,
        message: '',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedAgent) return;
    
    try {
      const response = await deleteAgent(selectedAgent.id);
      if (response.success) {
        fetchAgencyAndAgents();
        setIsDeleteDialogOpen(false);
        setSelectedAgent(null);
      }
    } catch (error) {
      console.error('Failed to delete agent:', error);
    }
  };

  if (loading.isLoading) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center">
        <Loader text={loading.message} />
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">{t('AgencyAgentsPage.notFound.message')}</p>
          <Button onClick={() => navigate('/app/agency')} className="mt-4">
            {t('AgencyAgentsPage.notFound.backToAgencies')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/app/agency/${agencyId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {t('AgencyAgentsPage.header.title', { agencyName: agency.agencyName })}
            </h1>
            <p className="text-gray-500 mt-1">{t('AgencyAgentsPage.header.subtitle')}</p>
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('AgencyAgentsPage.header.addAgent')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              {t('AgencyAgentsPage.stats.totalAgents')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              {t('AgencyAgentsPage.stats.activeAgents')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agents.filter(a => !a.isDeleted).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              {t('AgencyAgentsPage.stats.inactiveAgents')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agents.filter(a => a.isDeleted).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t('AgencyAgentsPage.search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Agents Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('AgencyAgentsPage.table.agentName')}</TableHead>
                <TableHead>{t('AgencyAgentsPage.table.email')}</TableHead>
                <TableHead>{t('AgencyAgentsPage.table.phone')}</TableHead>
                <TableHead>{t('AgencyAgentsPage.table.status')}</TableHead>
                <TableHead>{t('AgencyAgentsPage.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    {searchTerm
                      ? t('AgencyAgentsPage.table.noResultsSearch')
                      : t('AgencyAgentsPage.table.noAgents')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAgents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">{agent.agentName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {agent.agentEmail}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {agent.agentPhone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={agent.isDeleted ? 'secondary' : 'default'}>
                        {agent.isDeleted ? t('AgencyAgentsPage.table.inactive') : t('AgencyAgentsPage.table.active')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedAgent(agent);
                            setIsEditDialogOpen(true);
                          }}
                          title={t('AgencyAgentsPage.tooltips.editAgent')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedAgent(agent);
                            setIsDeleteDialogOpen(true);
                          }}
                          title={t('AgencyAgentsPage.tooltips.deleteAgent')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateAgentDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        agencyId={agencyId!}
        onSuccess={fetchAgencyAndAgents}
      />

      {selectedAgent && (
        <>
          <EditAgentDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            agent={selectedAgent}
            onSuccess={fetchAgencyAndAgents}
          />

          <DeleteConfirmDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={handleDelete}
            title={t('AgencyAgentsPage.deleteDialog.title')}
            description={t('AgencyAgentsPage.deleteDialog.description', { agentName: selectedAgent.agentName })}
          />
        </>
      )}
    </div>
  );
};

export default AgencyAgentsPage;
