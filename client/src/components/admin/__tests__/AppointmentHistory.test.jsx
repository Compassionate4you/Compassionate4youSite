// DT-837 Sprint 9
// Gandhar Tare
// Admin Appointments tab: Current and History kept apart, history search,
// history tags (DT-927) and archiving. The API is mocked.
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import AppointmentsTab from '../AppointmentsTab'
import useAppointments, { compareAppointments, slotMinutes } from '../../../hooks/admin/useAppointments'
import {
  apiGetAllAppointments,
  apiUpdateHistoryTag
} from '../../../services/api'

vi.mock('../../../services/api', () => ({
  apiGetAllAppointments: vi.fn(),
  apiCreateAdminAppointment: vi.fn(),
  apiUpdateAdminAppointment: vi.fn(),
  apiDeleteAdminAppointment: vi.fn(),
  apiUpdateHistoryTag: vi.fn()
}))

function appt (overrides) {
  return {
    id: 'x',
    fullName: 'Someone',
    email: 'someone@example.com',
    serviceType: 'Home Health',
    date: '2099-01-15',
    timeSlot: '10:00 AM',
    status: 'CONFIRMED',
    historyTag: null,
    section: 'current',
    ...overrides
  }
}

const SERVER_LIST = [
  appt({ id: 'c10', fullName: 'Ten O Clock', timeSlot: '10:00 AM' }),
  appt({ id: 'c9', fullName: 'Nine O Clock', timeSlot: '9:00 AM' }),
  appt({ id: 'h-old', fullName: 'Alice Old', date: '2024-03-01', status: 'COMPLETED', historyTag: 'COMPLETED', section: 'history' }),
  appt({ id: 'h-new', fullName: 'Bob New', date: '2025-06-01', status: 'PENDING', historyTag: 'NOT_CONFIRMED', section: 'history' }),
  appt({ id: 'h-cxl', fullName: 'Carol Cancel', date: '2099-02-01', status: 'CANCELLED', historyTag: null, section: 'history' })
]

// Wires the hook to the tab the same way AdminDashboard does.
function Harness () {
  const a = useAppointments()
  return (
    <AppointmentsTab
      showAppointmentForm={a.showAppointmentForm}
      editingAppointmentId={a.editingAppointmentId}
      appointmentForm={a.appointmentForm}
      appointments={a.appointments}
      appointmentsLoading={a.appointmentsLoading}
      appointmentsError={a.appointmentsError}
      appointmentSubmitting={a.appointmentSubmitting}
      appointmentSubmitError={a.appointmentSubmitError}
      onOpenAddAppointment={a.handleOpenAddAppointment}
      onAppointmentInputChange={a.handleAppointmentInputChange}
      onSubmitAppointment={a.handleAddAppointment}
      onCancelAppointment={a.handleCancelAppointment}
      onEditAppointment={a.handleEditAppointment}
      onDeleteAppointment={a.handleDeleteAppointment}
      formatAppointmentDate={a.formatAppointmentDate}
      appointmentView={a.appointmentView}
      onChangeView={a.setAppointmentView}
      currentAppointments={a.currentAppointments}
      historyAppointments={a.historyAppointments}
      historySearch={a.historySearch}
      onHistorySearchChange={a.setHistorySearch}
      onChangeHistoryTag={a.handleChangeHistoryTag}
      tagSavingId={a.tagSavingId}
      tagError={a.tagError}
    />
  )
}

const rowNames = () =>
  screen.getAllByRole('row').slice(1).map((row) => within(row).getAllByRole('cell')[0].textContent)

async function openHistory (user) {
  await screen.findByText('Ten O Clock')
  await user.click(screen.getByRole('tab', { name: /History/ }))
}

beforeEach(() => {
  apiGetAllAppointments.mockResolvedValue({ appointments: SERVER_LIST })
})

describe('sorting helpers', () => {
  it('reads times in clock order, not as text', () => {
    expect(slotMinutes('9:00 AM')).toBeLessThan(slotMinutes('10:00 AM'))
    expect(slotMinutes('1:00 PM')).toBeGreaterThan(slotMinutes('11:00 AM'))
  })

  it('sorts oldest first by default and newest first when asked', () => {
    const a = { date: '2025-01-01', timeSlot: '9:00 AM' }
    const b = { date: '2025-01-01', timeSlot: '10:00 AM' }
    expect(compareAppointments(a, b)).toBeLessThan(0)
    expect(compareAppointments(a, b, -1)).toBeGreaterThan(0)
  })
})

describe('Current tab', () => {
  it('shows only current appointments, soonest first by time', async () => {
    render(<Harness />)

    await screen.findByText('Ten O Clock')
    expect(screen.getByRole('tab', { name: 'Current (2)' })).toHaveAttribute('aria-selected', 'true')
    expect(rowNames()).toEqual(['Nine O Clock', 'Ten O Clock'])
    expect(screen.queryByText('Alice Old')).not.toBeInTheDocument()
  })

  it('labels the remove button Archive instead of Delete', async () => {
    render(<Harness />)
    await screen.findByText('Ten O Clock')

    expect(screen.getAllByRole('button', { name: 'Archive' })).toHaveLength(2)
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })
})

describe('History tab (DT-837)', () => {
  it('shows past and cancelled appointments, newest first', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await openHistory(user)

    // A cancelled appointment is in history even though its date is ahead.
    expect(rowNames()).toEqual(['Carol Cancel', 'Bob New', 'Alice Old'])
    expect(screen.queryByText('Ten O Clock')).not.toBeInTheDocument()
  })

  it('shows the year, since history spans years', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await openHistory(user)

    expect(screen.getByText('March 1, 2024')).toBeInTheDocument()
  })

  it('has no Add or Edit buttons - history is tag-only plus archive', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await openHistory(user)

    expect(screen.queryByRole('button', { name: 'Add Appointment' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Archive' })).toHaveLength(3)
  })

  it('searches by patient name', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await openHistory(user)

    await user.type(screen.getByLabelText('Search by patient name'), 'bob')

    expect(rowNames()).toEqual(['Bob New'])
  })

  it('says so when no one matches the search', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await openHistory(user)

    await user.type(screen.getByLabelText('Search by patient name'), 'zzz')

    expect(screen.getByText('No past appointments match that name.')).toBeInTheDocument()
  })

  it('shows each appointment\'s tag', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await openHistory(user)

    expect(screen.getByLabelText('Tag for Alice Old')).toHaveValue('COMPLETED')
    expect(screen.getByLabelText('Tag for Bob New')).toHaveValue('NOT_CONFIRMED')
    // An older cancellation with no tag yet asks the admin who cancelled.
    expect(screen.getByLabelText('Tag for Carol Cancel')).toHaveDisplayValue('Cancelled (choose who)')
  })

  it('offers exactly the five tags', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await openHistory(user)

    const options = within(screen.getByLabelText('Tag for Alice Old'))
      .getAllByRole('option')
      .map((o) => o.textContent)
    expect(options).toEqual([
      'Completed',
      'No show',
      'Cancelled by patient',
      'Cancelled by staff',
      'Not confirmed'
    ])
  })
})

describe('changing a tag (DT-927)', () => {
  it('saves the new tag and shows it', async () => {
    const user = userEvent.setup()
    apiUpdateHistoryTag.mockResolvedValue({
      appointment: { ...SERVER_LIST[2], historyTag: 'NO_SHOW' }
    })
    render(<Harness />)
    await openHistory(user)

    await user.selectOptions(screen.getByLabelText('Tag for Alice Old'), 'NO_SHOW')

    expect(apiUpdateHistoryTag).toHaveBeenCalledWith('h-old', 'NO_SHOW')
    await waitFor(() => expect(screen.getByLabelText('Tag for Alice Old')).toHaveValue('NO_SHOW'))
  })

  it('shows an error and keeps the old tag if saving fails', async () => {
    const user = userEvent.setup()
    apiUpdateHistoryTag.mockRejectedValue(new Error('Only appointments in history can be tagged.'))
    render(<Harness />)
    await openHistory(user)

    await user.selectOptions(screen.getByLabelText('Tag for Alice Old'), 'NO_SHOW')

    expect(await screen.findByRole('alert')).toHaveTextContent('Only appointments in history can be tagged.')
    expect(screen.getByLabelText('Tag for Alice Old')).toHaveValue('COMPLETED')
  })
})
