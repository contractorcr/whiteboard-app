const express=require('express');
const Canvas=require('../models/canvasmodel') 
const getcanvas= async (req,res)=>{
     try{
        const canvases = await Canvas.getcanvases(req.email);
        res.status(200).json({ canvases });
     }catch(err){
        const status = err.message === 'Invalid credentials' ? 401 : 500;
       res.status(status).json({ error: err.message });
     }
}
const createcanvas = async (req, res) => {
    try {
        const rawName = typeof req.body.name === 'string' ? req.body.name.trim() : '';
        const name = rawName.slice(0, 100) || 'Untitled canvas';

        const canvas = await Canvas.createcanvas(req.email, name);

        res.status(201).json({ canvas });
    } catch (err) {
        console.error('CREATE CANVAS ERROR:', err);
        const status = err.message === 'User not found' ? 404 : 500;
        res.status(status).json({ error: err.message });
    }
};
const getcanvasbyid = async (req,res)=> {
     try{
          const canvas = await Canvas.getcanvasbyid(req.email, req.params.id);
          res.status(200).json({ canvas });
     }catch(err){
         console.error('GET CANVAS BY ID ERROR:', err);
         const status = err.message === 'Canvas not found' || err.message === 'User not found' ? 404 : 500;
            
         res.status(status).json({ error: err.message });
     }
}
const updatecanvas = async function (req, res) {
    try {
        const id = req.params.id;
        const email = req.email;
        const elements = req.body.elements;

        const canvas = await Canvas.updatecanvas(id, email, elements);

        res.status(200).json({
            message: 'Canvas updated successfully',
            canvas
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};
const deletecanvas = async (req, res) => {
    try {
        const email = req.email;
        const id = req.params.id;

        const canvas = await Canvas.deletecanvas(id, email);

        res.status(200).json({
            message: 'Canvas deleted successfully',
            canvas
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const renamecanvas = async (req, res) => {
    try {
        const email = req.email;
        const id = req.params.id;
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                error: 'Canvas name cannot be empty'
            });
        }

        const canvas = await Canvas.renamecanvas(email, id, name.trim());

        res.status(200).json({
            message: 'Canvas renamed successfully',
            canvas
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const sharecanvas = async (req, res) => {
    try {
        const { email } = req.body;

        if (typeof email !== 'string' || !email.trim()) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await Canvas.sharecanvas(req.email, req.params.id, email.trim());
        res.status(200).json({ message: 'Canvas shared successfully', user });
    } catch (err) {
        console.error('SHARE CANVAS ERROR:', err);

        const statuses = {
            'Canvas not found': 404,
            'User not found': 404,
            'No user found with that email': 404,
            'You are not authorized to share this canvas': 403,
            "You can't share a canvas with yourself": 400,
            'Already shared with this user': 400,
        };

        res.status(statuses[err.message] || 500).json({ error: err.message });
    }
};
module.exports = { getcanvas, createcanvas,getcanvasbyid,updatecanvas,deletecanvas,renamecanvas,sharecanvas};
