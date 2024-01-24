import EditSemesterButton from '@/components/admin/semester/edit-semester-button'
import { ProgrammeLeaderTable } from '@/components/admin/semester/programme-leader-table'
import { SelectSemesterWrapper } from '@/components/admin/semester/select-semester-wrapper'
import { TimelineTable } from '@/components/admin/semester/timeline-table'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Suspense } from 'react'

const Semester = async ({
	searchParams,
}: {
	searchParams?: {
		semester: string
	}
}) => {
	return (
		<div className='space-y-4'>
			<Header
				title='Semester Management'
				description='Create or edit semester timeline and programme!'
				actions={
					<Button>
						<Link href='./semester/create'>Create</Link>
					</Button>
				}
			/>

			<div className='py-8 space-y-4'>
				<div className='flex justify-between'>
					<SelectSemesterWrapper searchParams={searchParams} />
					<EditSemesterButton semester={searchParams?.semester} />
				</div>
				<Suspense fallback={<h1>Loading...</h1>}>
					{searchParams?.semester ? (
						<>
							<TimelineTable searchParams={searchParams} />
							<ProgrammeLeaderTable searchParams={searchParams} />
						</>
					) : (
						<h1 className='text-muted-foreground'>
							Choose from dropdown above or create a new semester
						</h1>
					)}
				</Suspense>
			</div>
		</div>
	)
}

export default Semester
