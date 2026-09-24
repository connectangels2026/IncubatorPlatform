'use client';

import React, { useState } from 'react';
import { Button } from '@/frontend/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/frontend/components/ui/Card';
import { Modal } from '@/frontend/components/ui/Modal';
import { Spinner } from '@/frontend/components/ui/Spinner';
import { Alert } from '@/frontend/components/ui/Alert';
import { Badge } from '@/frontend/components/ui/Badge';
import { Avatar } from '@/frontend/components/ui/Avatar';
import { Dropdown } from '@/frontend/components/ui/Dropdown';
import { Tabs } from '@/frontend/components/ui/Tabs';
import { Pagination } from '@/frontend/components/ui/Pagination';
import { PageHeader } from '@/frontend/components/layouts/PageHeader';
import { TextInput } from '@/frontend/components/forms/TextInput';
import { Textarea } from '@/frontend/components/forms/Textarea';
import { Select } from '@/frontend/components/forms/Select';
import { MultiSelect } from '@/frontend/components/forms/MultiSelect';
import { Checkbox, RadioGroup } from '@/frontend/components/forms/Checkbox';
import { DatePicker, TimePicker } from '@/frontend/components/forms/DatePicker';
import { FileUpload } from '@/frontend/components/forms/FileUpload';
import { DataTable } from '@/frontend/components/table/DataTable';
import { BarChart, LineChart, PieChart } from '@/frontend/components/charts/Charts';
import { Mail, Plus, Trash2, Edit } from 'lucide-react';

export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [page, setPage] = useState(1);
  const [radioVal, setRadioVal] = useState('monthly');
  const [selectedTags, setSelectedTags] = useState(['AI & ML', 'FinTech']);

  const tableData = [
    { id: '1', name: 'NexHealth AI', sector: 'HealthTech', stage: 'MVP', revenue: '$50k' },
    { id: '2', name: 'PayBridge', sector: 'FinTech', stage: 'Growth', revenue: '$250k' },
    { id: '3', name: 'GreenGrid Solar', sector: 'CleanTech', stage: 'Seed', revenue: '$10k' },
    { id: '4', name: 'SkillVault', sector: 'EdTech', stage: 'Scaling', revenue: '$800k' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 sm:p-10 max-w-7xl mx-auto space-y-12">
      {/* 1. Header */}
      <PageHeader
        title="Design System & Component Library"
        description="Standardized UI toolkit for the Incubator Platform"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Design System' }]}
        action={<Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Open Modal</Button>}
      />

      {/* 2. Buttons & Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons & Badges</CardTitle>
          <CardDescription>Variants, sizes, and states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="default">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="destructive">Destructive Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button disabled>Disabled</Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <Badge variant="default">Default</Badge>
            <Badge variant="success">Active</Badge>
            <Badge variant="warning">Pending Review</Badge>
            <Badge variant="danger">High Priority</Badge>
            <Badge variant="info">MVP Stage</Badge>
            <Badge variant="purple">Investor Ready</Badge>
          </div>
        </CardContent>
      </Card>

      {/* 3. Feedback: Alerts & Spinners */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback & Alerts</CardTitle>
          <CardDescription>Status indicators and toast alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert type="success" title="Application Approved" message="NexHealth AI cohort application has been approved." />
          <Alert type="error" title="Action Blocked" message="Missing required organization credentials." />
          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Spinner size="sm" /> <span>Small Spinner</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Spinner size="md" /> <span>Medium Spinner</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Spinner size="lg" /> <span>Large Spinner</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Avatars & Dropdowns */}
      <Card>
        <CardHeader>
          <CardTitle>Avatars & Action Dropdowns</CardTitle>
          <CardDescription>User profiles and action triggers</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-8">
          <div className="flex items-center gap-3">
            <Avatar name="Sarah Connor" size="lg" />
            <Avatar name="Alex Vance" size="md" />
            <Avatar name="John Miller" size="sm" />
          </div>

          <Dropdown
            trigger={<Button variant="outline">User Actions ▾</Button>}
            items={[
              { label: 'Edit Profile', icon: <Edit className="w-4 h-4" />, onClick: () => alert('Edit') },
              { label: 'Delete User', icon: <Trash2 className="w-4 h-4" />, danger: true, onClick: () => alert('Delete') },
            ]}
          />
        </CardContent>
      </Card>

      {/* 5. Form Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Form Components</CardTitle>
          <CardDescription>Inputs, selects, tags, and pickers</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <TextInput label="Startup Name" placeholder="e.g. Acme Health" leftIcon={<Mail className="w-4 h-4" />} />
          <Select
            label="Incubation Stage"
            options={[
              { label: 'Idea Stage', value: 'idea' },
              { label: 'MVP Validated', value: 'mvp' },
              { label: 'Growth / Seed', value: 'growth' },
            ]}
          />
          <MultiSelect
            label="Focus Areas / Tags"
            options={['AI & ML', 'FinTech', 'CleanTech', 'HealthTech', 'AgriTech', 'EdTech']}
            selected={selectedTags}
            onChange={setSelectedTags}
          />
          <div className="grid grid-cols-2 gap-3">
            <DatePicker label="Cohort Start Date" />
            <TimePicker label="Pitch Time" />
          </div>
          <div className="sm:col-span-2">
            <Textarea label="Executive Summary" placeholder="Write a short pitch..." />
          </div>
          <div className="sm:col-span-2">
            <FileUpload label="Pitch Deck / Investment Memo" />
          </div>
          <div className="sm:col-span-2 flex flex-col gap-3">
            <Checkbox label="I confirm the founder details are verified" defaultChecked />
            <RadioGroup
              name="billing"
              label="Reporting Cycle"
              options={[
                { value: 'monthly', label: 'Monthly Reporting', description: 'Detailed KPI updates every 30 days' },
                { value: 'quarterly', label: 'Quarterly Review', description: 'High-level milestones and board summary' },
              ]}
              selectedValue={radioVal}
              onChange={setRadioVal}
            />
          </div>
        </CardContent>
      </Card>

      {/* 6. Tabs & Pagination */}
      <Card>
        <CardHeader>
          <CardTitle>Tabs & Pagination</CardTitle>
          <CardDescription>Tab switching and page controls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs
            tabs={[
              { id: 'overview', label: 'Overview', count: 12 },
              { id: 'team', label: 'Team Members', count: 4 },
              { id: 'investors', label: 'Allocated Investors', count: 3 },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
          <Pagination currentPage={page} totalPages={5} onPageChange={setPage} />
        </CardContent>
      </Card>

      {/* 7. DataTable */}
      <Card>
        <CardHeader>
          <CardTitle>Data Table</CardTitle>
          <CardDescription>Sortable columns and row actions</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            searchKey="name"
            columns={[
              { key: 'name', header: 'Startup Name', sortable: true },
              { key: 'sector', header: 'Sector', sortable: true },
              {
                key: 'stage',
                header: 'Stage',
                render: (row) => <Badge variant="info">{row.stage}</Badge>,
              },
              { key: 'revenue', header: 'Annual Revenue', sortable: true },
            ]}
            data={tableData}
            actions={[
              { label: 'View Profile', onClick: (row) => alert('View: ' + row.name) },
              { label: 'Delete Startup', danger: true, onClick: (row) => alert('Delete: ' + row.name) },
            ]}
          />
        </CardContent>
      </Card>

      {/* 8. Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Modern Chart Wrappers</CardTitle>
          <CardDescription>Bar, Line, and Pie charts</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-xs font-semibold text-slate-500 mb-3">Applications Trend (Bar)</h4>
            <BarChart
              data={[
                { label: 'Jan', value: 25 },
                { label: 'Feb', value: 45 },
                { label: 'Mar', value: 38 },
                { label: 'Apr', value: 65 },
                { label: 'May', value: 85 },
              ]}
            />
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-500 mb-3">Revenue Growth (Line)</h4>
            <LineChart
              data={[
                { label: 'Q1', value: 20 },
                { label: 'Q2', value: 45 },
                { label: 'Q3', value: 75 },
                { label: 'Q4', value: 110 },
              ]}
            />
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-500 mb-3">Portfolio Sectors (Pie)</h4>
            <PieChart
              data={[
                { label: 'AI & ML', value: 40, color: '#2563eb' },
                { label: 'FinTech', value: 30, color: '#06b6d4' },
                { label: 'HealthTech', value: 20, color: '#10b981' },
                { label: 'CleanTech', value: 10, color: '#f59e0b' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Modal Demo */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Sample Modal Dialog"
        description="This modal demonstrates popup dialogs with backdrop blur and escape key handling."
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-600">
            You can put any form, confirmation message, or content inside this reusable modal.
          </p>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setModalOpen(false)}>Confirm Action</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
