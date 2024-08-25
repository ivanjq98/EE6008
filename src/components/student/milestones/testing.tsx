// 'use client'

// import { useSession } from 'next-auth/react'
// import { useRouter } from 'next/navigation'
// import { useForm } from 'react-hook-form'
// import { toast } from 'sonner'
// import * as z from 'zod'

// import { addProject } from '@/src/app/actions/common/project'
// import { Button } from '@/src/components/ui/button'
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage
// } from '@/src/components/ui/form'
// import { Input } from '@/src/components/ui/input'
// import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
// import { Textarea } from '@/src/components/ui/textarea'
// import { milestoneSchema } from '@/src/lib/schema'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { Venue } from '@prisma/client'

// type ProposalFormValues = z.infer<typeof milestoneSchema>

// interface AddProjectFormProps {
//   semesterId: string
//   programmeOptions: string[]
//   venueOptions: Venue[]
// }

// export function AddProjectForm({ semesterId, programmeOptions, venueOptions }: AddProjectFormProps) {
//   const router = useRouter()
//   const session = useSession()
//   const user = session?.data?.user

//   const form = useForm<ProposalFormValues>({
//     resolver: zodResolver(milestoneSchema),
//     defaultValues: {
//       objective: '',
//       comments: '',
//       semesterId
//     }
//   })

//   async function onSubmit(values: z.infer<typeof milestoneSchema>) {
//     if (!user?.studentId) return
//     const response = await addProject(values, user.studentId)
//     if (response.status === 'ERROR') {
//       toast.error(response.message)
//     } else {
//       toast.success(response.message)
//       router.push(`/fstudent/milestones`)
//       router.refresh()
//     }
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
//         <FormField
//           control={form.control}
//           name='semesterId'
//           render={({ field }) => (
//             <FormItem className='m-0 hidden'>
//               <FormLabel>Title</FormLabel>
//               <FormControl>
//                 <Input {...field} />
//               </FormControl>
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name='objective'
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Objective</FormLabel>
//               <FormControl>
//                 <Input {...field} />
//               </FormControl>
//               <FormDescription>Milestone Objective.</FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name='programme'
//           render={({ field }) => (
//             <FormItem className='md:col-span-2'>
//               <FormLabel>Start Date</FormLabel>
//               <Select onValueChange={field.onChange}>
//                 <FormControl>
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                 </FormControl>
//                 <SelectContent>
//                   {programmeOptions.map((programme) => (
//                     <SelectItem key={programme} value={programme}>
//                       {programme}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name='venueId'
//           render={({ field }) => (
//             <FormItem className='md:col-span-2'>
//               <FormLabel>End Date</FormLabel>
//               <Select onValueChange={field.onChange}>
//                 <FormControl>
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                 </FormControl>
//                 <SelectContent>
//                   <SelectGroup className='max-h-[10rem] overflow-y-auto'>
//                     {venueOptions.map(({ id, name, location }) => (
//                       <SelectItem key={id} value={id}>
//                         {name} - {location}
//                       </SelectItem>
//                     ))}
//                   </SelectGroup>
//                 </SelectContent>
//               </Select>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name='description'
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Description</FormLabel>
//               <FormControl>
//                 <Textarea
//                   placeholder='Enter a short summary of your project'
//                   className='h-[300px] resize-none'
//                   {...field}
//                 />
//               </FormControl>
//               <FormDescription>Max 1000 characters are allowed</FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name='description'
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>status</FormLabel>
//               <FormControl>
//                 <Textarea
//                   placeholder='Enter a short summary of your project'
//                   className='h-[300px] resize-none'
//                   {...field}
//                 />
//               </FormControl>
//               <FormDescription>Max 1000 characters are allowed</FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <Button type='submit'>Submit</Button>
//       </form>
//     </Form>
//   )
// }
