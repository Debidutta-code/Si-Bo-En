import { Router } from 'express';
import {  MasterRoomViewController } from '../controllers';

const masterRoomViewController = new MasterRoomViewController();

const roomViewRouter = Router();


//master room Views
roomViewRouter
    .route('/')
    .post(masterRoomViewController.createMasterRoomView.bind(masterRoomViewController))
    .get(masterRoomViewController.getAllMasterRoomViews.bind(masterRoomViewController));

roomViewRouter
    .route('/:id')
    .get(masterRoomViewController.getMasterRoomViewById.bind(masterRoomViewController))
    .patch(masterRoomViewController.updateMasterRoomView.bind(masterRoomViewController))
    .delete(masterRoomViewController.deleteMasterRoomView.bind(masterRoomViewController));

    export { roomViewRouter };