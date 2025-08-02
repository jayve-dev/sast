import React from 'react';
import { Modal } from '../ui/modal';
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import { Label } from "@/components/ui/label"
import {SelectCard} from "@/components/ui/select-card";

const  roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'staff', label: 'Staff' },

]

const AdminAdd = () => {
    return (
        <div>

            <Modal title="Create Account"
                    description="Add a new admin account to the system. Please fill in the required details below."
                   triggerText={<Button variant="secondary">Add Admin</Button>}
            >
                <div className={'grid grid-cols-2 gap-4 p-2 '}>
                <div className="grid w-full max-w-sm items-center gap-3 mb-2">
                    <Label htmlFor="facultyIdNumber">Faculty ID</Label>
                <Input type="number" id="facultyIdNumber" placeholder="Add the teacher biatch" />

                </div>
                <div className="grid w-full max-w-sm items-center gap-3  mb-2">
                    <Label htmlFor="facultyName">Faculty Name</Label>
                    <Input type="text" id="facultyName" placeholder="Email" />
                </div>
                    <div className="grid w-full max-w-sm items-center gap-3  mb-2">
                        <Label htmlFor="facultyEmail">Password</Label>
                        <Input type="email" id="facultyEmail" placeholder="Password" />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-3  mb-2">
                        <Label htmlFor="facultyPassword">Password</Label>
                        <Input type="password" id="facultyPassword" placeholder="Password" />
                    </div>
                    {/*<div className={'col-span-2'}>*/}
                    <div className="grid w-full  items-center gap-3 col-span-2  mb-2">
                        <Label htmlFor="facultyName">Role</Label>
                      <SelectCard options={roles} placeholder={'Select a role'} />
                    </div>
                    {/*</div>*/}
                </div>
            </Modal>

        </div>
    );
};

export {AdminAdd};