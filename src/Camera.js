
import { Fragment, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as tf from '@tensorflow/tfjs';
import { setModalData } from './reducers';
import Loader from './Loader';

function Camera(props) {
    const [isLoading, setLoading] = useState(true);
    const videoElm = useRef();
    async function main() {
        const video = videoElm.current;
        const canvas = document.querySelector('canvas');
        video.width = 196;
        video.height = 196;
        const webcam = await tf.data.webcam(video);
        setLoading(false);
        let [r1i, r2i, r3i, r4i] = [tf.tensor(0.), tf.tensor(0.), tf.tensor(0.), tf.tensor(0.)];
        const downsample_ratio = tf.tensor(0.5);
        while (true) {
            await tf.nextFrame();
            const img = await webcam.capture();
            const src = tf.tidy(() => img.expandDims(0).div(255));
            const [fgr, pha, r1o, r2o, r3o, r4o] = await props.modalData.executeAsync(
                { src, r1i, r2i, r3i, r4i, downsample_ratio },
                ['fgr', 'pha', 'r1o', 'r2o', 'r3o', 'r4o']
            );
            drawMatte(fgr.clone(), pha.clone(), canvas);
            canvas.style.background = 'rgb(255,255,255)';
            tf.dispose([img, src, fgr, pha, r1i, r2i, r3i, r4i]);
            [r1i, r2i, r3i, r4i] = [r1o, r2o, r3o, r4o];
        }
    }

    async function drawMatte(fgr, pha, canvas, background) {
        const rgba = tf.tidy(() => {
            const rgb = (fgr !== null) ?
                fgr.squeeze(0).mul(255).cast('int32') :
                tf.fill([pha.shape[1], pha.shape[2], 3], 255, 'int32');
            const a = (pha !== null) ?
                pha.squeeze(0).mul(255).cast('int32') :
                tf.fill([fgr.shape[1], fgr.shape[2], 1], 255, 'int32');
            return tf.concat([rgb, a], -1);
        });
        fgr && fgr.dispose();
        pha && pha.dispose();
        const [height, width] = rgba.shape.slice(0, 2);
        const pixelData = new Uint8ClampedArray(await rgba.data());
        const imageData = new ImageData(pixelData, width, height);
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').putImageData(imageData, 0, 0);
        console.log('hi');
        rgba.dispose();
    }
    useEffect(() => {
        if (props.modalData) {
            main()
        } else {
            props.setModalData()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.modalData])

    return (
        <Fragment>
             {isLoading ? <Loader /> : null }
            <video
                style={{
                    pointerEvents: 'none',
                    height: '196px',
                    width: '196px',
                    objectFit: 'cover',
                    borderRadius: '100%'
                }} ref={videoElm} autoPlay playsInline />
            <canvas
                style={{
                    background: 'rgb(255, 255, 255)',
                    borderRadius: '100%'
                }}
            />
        </Fragment>

    );
}



const mapStateToProps = (app) => {
    const { modalData } = app;
    return {
        modalData
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setModalData: bindActionCreators(setModalData, dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Camera);

